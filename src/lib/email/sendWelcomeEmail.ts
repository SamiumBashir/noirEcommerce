import { getResendClient, getEmailFrom } from "./resend";
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
 * Completely asynchronous & non-blocking.
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<SendWelcomeEmailResult> {
  const { email, name } = params;
  const resend = getResendClient();

  if (!resend) {
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

    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: `Welcome to NOIR Atelier, ${name}`,
      html,
      text,
    });

    if (error) {
      if (error.message?.includes("You can only send testing emails to your own email address")) {
        console.warn(
          `[RESEND NOTICE] Welcome Wish email to ${email} skipped due to Resend sandbox restriction (only account owner receives emails). Verify domain at resend.com/domains to deliver to all users.`
        );
      } else {
        console.error(`[EMAIL] Failed to deliver Welcome email to ${email}:`, error.message);
      }
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Welcome Wish email successfully delivered to ${email} (Message ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error(`[EMAIL] Unexpected error delivering Welcome email to ${email}:`, error?.message || error);
    return { success: false, error: error?.message || "Welcome email delivery failed" };
  }
}
