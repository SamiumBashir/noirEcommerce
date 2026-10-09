import { getMailTransporter, getEmailFrom } from "./nodemailer";
import { renderWelcomeEmail } from "./templates/welcomeEmail";

export interface SendWelcomeEmailParams {
  email: string;
  name: string;
}

export interface SendWelcomeEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends the official Welcome Email from NOIR Atelier upon successful OTP verification.
 * Follows strict Phase 7 rules:
 * - Subject: "Welcome to NOIR — Your Journey Begins"
 * - Dispatched only after email verification is committed in database.
 * - Records provider acceptance status.
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<SendWelcomeEmailResult> {
  const { email, name } = params;
  const transporter = getMailTransporter();

  if (!transporter) {
    console.log(`[EMAIL NOTICE] SMTP not configured. Welcome email simulated for ${email} (${name}).`);
    return {
      success: true,
      error: "DEV_MODE_LOGGED",
    };
  }

  try {
    const { html, text } = renderWelcomeEmail({
      userName: name,
      email,
    });

    const from = getEmailFrom();

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Welcome to NOIR — Your Journey Begins",
      html,
      text,
    });

    console.log(`[EMAIL] Welcome email successfully accepted by SMTP for ${email} (Message ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send Welcome email to ${email}:`, error?.message || error);
    return { success: false, error: error?.message || "Welcome email delivery failed" };
  }
}
