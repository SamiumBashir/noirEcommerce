import { Resend } from "resend";

let resendInstance: Resend | null = null;

/**
 * Returns a configured Resend client instance.
 * Returns null if RESEND_API_KEY is not defined.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your_resend_api_key") {
    return null;
  }

  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }

  return resendInstance;
}

/**
 * Returns the configured 'from' sender email.
 * Defaults to Resend's verified test sender 'onboarding@resend.dev' or custom domain.
 */
export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_EMAIL_FROM ||
    "NOIR Security <onboarding@resend.dev>"
  );
}
