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
 * Sends a 6-digit OTP verification email via configured SMTP transport.
 * Follows NOIR luxury aesthetic and security rules:
 * - Subject: "Verify your email address | NOIR" (Never puts OTP in subject or URLs)
 * - Returns diagnostic results without throwing unhandled exceptions.
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<SendOtpEmailResult> {
  const { email, name, otp, expiresInMinutes = 10 } = params;
  const transporter = getMailTransporter();

  if (!transporter) {
    console.warn(
      `\n[EMAIL NOTICE] SMTP is not configured in environment variables. ` +
      `Cannot dispatch verification email to ${email}.\n`
    );
    return {
      success: false,
      error: "SMTP_NOT_CONFIGURED",
    };
  }

  try {
    const { html, text } = renderOtpEmail({
      userName: name,
      otp,
      expiresInMinutes,
    });

    const from = getEmailFrom();

    // Subject must NEVER leak the OTP (Phase 4 requirement)
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your email address | NOIR",
      html,
      text,
    });

    console.log(`[EMAIL] OTP verification email dispatched to ${email} (Message ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}:`, error?.message || error);
    return { success: false, error: error?.message || "OTP delivery failed" };
  }
}
