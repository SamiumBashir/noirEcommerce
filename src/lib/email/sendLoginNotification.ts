import { getMailTransporter, getEmailFrom } from "./nodemailer";
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
 * Supports Redis BullMQ queue when available, or direct serverless execution via Nodemailer.
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
    // 1. Idempotency Check: Avoid sending duplicate emails for the same login
    if (loginActivityId) {
      await connectToDatabase();
      const existingActivity = await LoginActivityModel.findById(loginActivityId).lean();
      if (existingActivity && existingActivity.emailNotificationSent) {
        console.log(`[EMAIL] Duplicate prevention: Login notification already sent for activity ${loginActivityId}`);
        return { success: true, id: existingActivity.emailJobId };
      }
    }

    // 2. Queue Mode: If Redis is available, enqueue job
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

    // 3. Direct Execution: Send email via Nodemailer (Gmail SMTP)
    return await executeDirectEmailDelivery({
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
 * Direct delivery via Nodemailer Gmail SMTP
 */
export async function executeDirectEmailDelivery(params: {
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

  const transporter = getMailTransporter();

  if (!transporter) {
    const notice = "Gmail SMTP credentials (SMTP_USER, SMTP_PASS) not configured. Email notification skipped.";
    console.warn(`[EMAIL] ${notice} Target: ${email}`);

    if (loginActivityId) {
      await connectToDatabase();
      await LoginActivityModel.findByIdAndUpdate(loginActivityId, {
        $set: {
          emailNotificationSent: false,
          emailNotificationError: "SMTP_NOT_CONFIGURED",
        },
      }).catch(() => {});
    }

    return {
      success: false,
      error: "SMTP_NOT_CONFIGURED",
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

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "New Login Detected — NOIR Security",
      html,
      text,
    });

    console.log(`[EMAIL] Login notification sent successfully to ${email} (Message ID: ${info.messageId})`);

    if (loginActivityId) {
      await connectToDatabase();
      await LoginActivityModel.findByIdAndUpdate(loginActivityId, {
        $set: {
          emailNotificationSent: true,
          emailJobId: info.messageId,
          emailNotificationError: undefined,
        },
      }).catch(() => {});
    }

    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL] Gmail delivery failed for ${email}:`, error.message);

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
}

// Backwards-compatible export alias for worker queue
export const executeDirectResendDelivery = executeDirectEmailDelivery;
