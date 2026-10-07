import { getMailTransporter, getEmailFrom } from "./nodemailer";
import { renderDeactivationEmail } from "./templates/deactivationEmail";

export interface SendDeactivationEmailParams {
  email: string;
  name: string;
  reason?: string;
}

export interface SendDeactivationEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends an official Account Deactivation confirmation email via Nodemailer (Gmail SMTP).
 * Non-blocking: failures NEVER prevent account deactivation.
 */
export async function sendDeactivationEmail(
  params: SendDeactivationEmailParams
): Promise<SendDeactivationEmailResult> {
  const { email, name, reason } = params;
  const transporter = getMailTransporter();

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date()) + " UTC";

  if (!transporter) {
    console.log(`[EMAIL DEV MODE] Deactivation notice simulated for: ${email}`);
    return {
      success: true,
      error: "DEV_MODE_LOGGED",
    };
  }

  try {
    const { html, text } = renderDeactivationEmail({
      userName: name,
      email,
      deactivatedAt: formattedDate,
      reason,
    });

    const from = getEmailFrom();

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Account Deactivated — NOIR Atelier",
      html,
      text,
    });

    console.log(`[EMAIL] Deactivation confirmation delivered to ${email} (Message ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to deliver deactivation notice to ${email}:`, error?.message || error);
    return { success: false, error: error?.message || "Deactivation email delivery failed" };
  }
}
