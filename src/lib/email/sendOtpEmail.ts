import { getResendClient, getEmailFrom } from "./resend";
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
 * Sends a 6-digit OTP verification email via Resend.
 * Non-blocking and resilient: in dev environments without Resend keys, logs the OTP safely.
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<SendOtpEmailResult> {
  const { email, name, otp, expiresInMinutes = 10 } = params;
  const resend = getResendClient();

  if (!resend) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL DEV MODE] OTP code for ${email}: ${otp}`);
    console.log(`(Set a valid RESEND_API_KEY in .env.local for live dispatch)`);
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

    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: `Your NOIR Atelier Verification Code: ${otp}`,
      html,
      text,
    });

    if (error) {
      console.error(`[EMAIL] Failed to send OTP email to ${email}:`, error.message);
      // In case of provider error, log code to server console as safety net
      console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] OTP verification email delivered to ${email} (Message ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error(`[EMAIL] Unexpected error sending OTP to ${email}:`, error?.message || error);
    console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);
    return { success: false, error: error?.message || "OTP delivery failed" };
  }
}
