import { getResendClient, getEmailFrom } from "./resend";
import { renderLoginNotificationEmail } from "./templates/loginNotificationEmail";
import { LoginActivityModel } from "../db/models/LoginActivity";
import { connectToDatabase } from "../db/mongoose";
import { enqueueLoginEmailJob, isRedisConfigured } from "../queue/emailQueue";

export interface SendLoginNotificationParams {
  email: string;
  name: string;
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  loginActivityId?: string;
  loginTime?: string;
}

export interface SendLoginNotificationResult {
  success: boolean;
  queued?: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a professional security login notification email to the user.
 * Supports Redis BullMQ queue when available, or direct serverless execution.
 * Completely non-blocking and safe: failures NEVER affect user authentication.
 */
export async function sendLoginNotification(
  params: SendLoginNotificationParams
): Promise<SendLoginNotificationResult> {
  const {
    email,
    name,
    ip,
    userAgent,
    device,
    browser,
    os,
    location,
    loginActivityId,
  } = params;

  const loginTime =
    params.loginTime ||
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "UTC",
    }).format(new Date()) + " UTC";

  try {
    // 1. Idempotency Check (Section 10): Avoid sending duplicate emails for the same login
    if (loginActivityId) {
      await connectToDatabase();
      const existingActivity = await LoginActivityModel.findById(loginActivityId).lean();
      if (existingActivity && existingActivity.emailNotificationSent) {
        console.log(`[EMAIL] Duplicate prevention: Login notification already sent for activity ${loginActivityId}`);
        return { success: true, id: existingActivity.emailJobId };
      }
    }

    // 2. Queue Mode (Section 9): If Redis is available, enqueue job
    if (isRedisConfigured()) {
      const enqueueResult = await enqueueLoginEmailJob({
        email,
        name,
        ip,
        userAgent,
        device,
        browser,
        os,
        location,
        loginTime,
        loginActivityId,
      });

      if (enqueueResult.enqueued) {
        if (loginActivityId) {
          await LoginActivityModel.findByIdAndUpdate(loginActivityId, {
            $set: { emailJobId: enqueueResult.jobId },
          }).catch(() => {});
        }
        return { success: true, queued: true, id: enqueueResult.jobId };
      }
    }

    // 3. Direct Serverless Execution: Send email via Resend
    return await executeDirectResendDelivery({
      email,
      name,
      ip,
      userAgent,
      device,
      browser,
      os,
      location,
      loginTime,
      loginActivityId,
    });
  } catch (error: any) {
    // Section 8: Always catch errors safely so authentication is NEVER blocked
    console.error("[EMAIL] Unexpected error in sendLoginNotification:", error?.message || error);
    if (loginActivityId) {
      await connectToDatabase();
      await LoginActivityModel.findByIdAndUpdate(loginActivityId, {
        $set: {
          emailNotificationSent: false,
          emailNotificationError: error?.message || "Unexpected email error",
        },
      }).catch(() => {});
    }
    return { success: false, error: error?.message || "Email dispatch failed" };
  }
}

/**
 * Direct delivery via Resend API
 */
export async function executeDirectResendDelivery(params: {
  email: string;
  name: string;
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  loginTime: string;
  loginActivityId?: string;
}): Promise<SendLoginNotificationResult> {
  const {
    email,
    name,
    ip,
    device,
    browser,
    os,
    location,
    loginTime,
    loginActivityId,
  } = params;

  const resend = getResendClient();

  if (!resend) {
    const notice = "RESEND_API_KEY is not configured or in development mode. Email notification skipped.";
    console.warn(`[EMAIL] ${notice} Target: ${email}`);

    if (loginActivityId) {
      await connectToDatabase();
      await LoginActivityModel.findByIdAndUpdate(loginActivityId, {
        $set: {
          emailNotificationSent: false,
          emailNotificationError: "RESEND_API_KEY_NOT_CONFIGURED",
        },
      }).catch(() => {});
    }

    return {
      success: false,
      error: "RESEND_API_KEY_NOT_CONFIGURED",
    };
  }

  // Render cross-client responsive email
  const { html, text } = renderLoginNotificationEmail({
    userName: name,
    loginTime,
    device,
    browser,
    os,
    ip,
    location,
  });

  const from = getEmailFrom();

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: "New Login Detected",
    html,
    text,
  });

  if (error) {
    if (error.message?.includes("You can only send testing emails to your own email address")) {
      console.warn(
        `[RESEND NOTICE] Login security alert to ${email} skipped due to Resend sandbox restriction (only account owner receives emails). Verify domain at resend.com/domains to deliver to all users.`
      );
    } else {
      console.error(`[EMAIL] Resend delivery failed for ${email}:`, error.message);
    }

    if (loginActivityId) {
      await connectToDatabase();
      await LoginActivityModel.findByIdAndUpdate(loginActivityId, {
        $set: {
          emailNotificationSent: false,
          emailNotificationError: error.message,
        },
      }).catch(() => {});
    }

    return { success: false, error: error.message };
  }

  console.log(`[EMAIL] Login notification sent successfully to ${email} (Message ID: ${data?.id})`);

  if (loginActivityId) {
    await connectToDatabase();
    await LoginActivityModel.findByIdAndUpdate(loginActivityId, {
      $set: {
        emailNotificationSent: true,
        emailJobId: data?.id,
        emailNotificationError: undefined,
      },
    }).catch(() => {});
  }

  return { success: true, id: data?.id };
}
