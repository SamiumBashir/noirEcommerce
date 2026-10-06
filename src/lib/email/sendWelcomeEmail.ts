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
 * Sends an official Welcome Wish email from NOIR Atelier upon successful account creation & verification.
 * Dispatched via Nodemailer (Gmail SMTP). Completely asynchronous & non-blocking.
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<SendWelcomeEmailResult> {
  const { email, name } = params;
  const transporter = getMailTransporter();

  if (!transporter) {
    console.log(`[EMAIL DEV MODE] Welcome Wish email simulated for: ${email} (${name})`);
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
      subject: `Welcome to NOIR Atelier, ${name}`,
      html,
      text,
    });

    console.log(`[EMAIL] Welcome Wish email successfully delivered to ${email} (Message ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL] Unexpected error delivering Welcome email to ${email}:`, error?.message || error);
    return { success: false, error: error?.message || "Welcome email delivery failed" };
  }
}
