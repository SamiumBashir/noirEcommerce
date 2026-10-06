import { getMailTransporter, getEmailFrom } from "./nodemailer";
import { renderOtpEmail } from "./templates/otpEmail";

export interface SendOtpEmailParams {
  email: string;
  name: string;
  otp: string;
  expiresInMinutes?: number;
}

export interface SendOtpEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a 6-digit OTP verification email via Nodemailer (Gmail SMTP).
 * Returns clear diagnostic results for serverless execution.
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<SendOtpEmailResult> {
  const { email, name, otp, expiresInMinutes = 10 } = params;
  const transporter = getMailTransporter();

  if (!transporter) {
    console.warn(
      `\n[EMAIL WARNING] SMTP_USER or SMTP_PASS is missing in environment variables. ` +
      `Cannot send email to ${email}. Active OTP: ${otp}\n`
    );
    return {
      success: false,
      error: "SMTP_CREDENTIALS_NOT_CONFIGURED",
    };
  }

  try {
    const { html, text } = renderOtpEmail({
      userName: name,
      otp,
      expiresInMinutes,
    });

    const from = getEmailFrom();

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `Your NOIR Atelier Verification Code: ${otp}`,
      html,
      text,
    });

    console.log(`[EMAIL] OTP verification email sent via Gmail to ${email} (Message ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email} via Gmail SMTP:`, error?.message || error);
    console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);
    return { success: false, error: error?.message || "OTP delivery failed" };
  }
}
