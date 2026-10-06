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
 * Non-blocking and resilient: in dev environments without SMTP credentials, logs the OTP safely.
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<SendOtpEmailResult> {
  const { email, name, otp, expiresInMinutes = 10 } = params;
  const transporter = getMailTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL DEV MODE] OTP code for ${email}: ${otp}`);
    console.log(`(Set SMTP_USER and SMTP_PASS in .env.local for live Gmail dispatch)`);
    console.log(`======================================================\n`);
    return {
      success: true,
      error: "DEV_MODE_LOGGED",
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
    console.error(`[EMAIL] Error sending OTP to ${email} via Gmail SMTP:`, error?.message || error);
    // In case of error, log code to server console as fallback
    console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);
    return { success: false, error: error?.message || "OTP delivery failed" };
  }
}
