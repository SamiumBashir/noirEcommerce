import { getMailTransporter, getEmailFrom } from "./nodemailer";
import { renderPasswordResetEmail } from "./templates/passwordResetEmail";

export interface SendPasswordResetEmailParams {
  email: string;
  name: string;
  otp: string;
  expiresInMinutes?: number;
}

export interface SendPasswordResetEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Dispatches a single-use 6-digit password reset OTP email via the configured SMTP transport.
 * Never leaks the OTP in the email subject line or HTTP query string.
 */
export async function sendPasswordResetEmail(
  params: SendPasswordResetEmailParams
): Promise<SendPasswordResetEmailResult> {
  const { email, name, otp, expiresInMinutes = 10 } = params;
  const transporter = getMailTransporter();

  if (!transporter) {
    console.warn(
      `\n[EMAIL NOTICE] SMTP is not configured in environment variables. ` +
      `Cannot dispatch password reset email to ${email}.\n`
    );
    return {
      success: false,
      error: "SMTP_NOT_CONFIGURED",
    };
  }

  try {
    const { html, text } = renderPasswordResetEmail({
      userName: name,
      otp,
      expiresInMinutes,
    });

    const from = getEmailFrom();

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Reset your password | NOIR",
      html,
      text,
    });

    console.log(`[EMAIL] Password reset code dispatched to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to dispatch password reset email to ${email}:`, error?.message || error);
    return { success: false, error: error?.message || "Delivery failed" };
  }
}
