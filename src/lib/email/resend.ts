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
 * Defaults to Resend's verified test sender 'onboarding@resend.dev' or custom verified domain.
 * Automatically guards against unverified public webmail domains (@gmail.com, @yahoo.com, etc.)
 * which Resend rejects with a 403 validation error.
 */
export function getEmailFrom(): string {
  const configuredFrom =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_EMAIL_FROM?.trim() ||
    "NOIR Atelier <onboarding@resend.dev>";

  // Extract the email address part (inside <...> or direct)
  const emailMatch = configuredFrom.match(/<([^>]+)>/);
  const pureEmail = (emailMatch ? emailMatch[1] : configuredFrom).toLowerCase();

  // Public domains that CANNOT be verified on Resend:
  const publicWebmails = ["@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com", "@live.com", "@icloud.com"];
  const isPublicWebmail = publicWebmails.some((domain) => pureEmail.endsWith(domain));

  if (isPublicWebmail) {
    console.warn(
      `[EMAIL CONFIG WARNING] EMAIL_FROM is set to a public email provider (${pureEmail}). ` +
      `Resend requires a custom domain or 'onboarding@resend.dev' and will reject ${pureEmail}. ` +
      `Auto-falling back to 'NOIR Atelier <onboarding@resend.dev>'. ` +
      `To use your own domain, verify it at https://resend.com/domains.`
    );
    return "NOIR Atelier <onboarding@resend.dev>";
  }

  return configuredFrom;
}
