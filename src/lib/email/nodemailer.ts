import nodemailer, { Transporter } from "nodemailer";

/**
 * Returns a configured Nodemailer Transporter instance for Gmail SMTP.
 * Fully optimized for serverless environments (Vercel Functions / AWS Lambda):
 * - No socket pooling to avoid stale/frozen TCP sockets after container freeze
 * - Automatic string sanitization to protect against quotes or accidental variable names
 * - Built-in connection and socket timeouts to prevent hung requests
 */
export function getMailTransporter(): Transporter | null {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER)?.trim();
  let pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD)?.trim();

  if (!user || !pass || pass === "your_gmail_app_password_here") {
    return null;
  }

  // Sanitize: strip spaces, surrounding quotes, or accidental "SMTP_PASS=" prefix
  pass = pass
    .replace(/\s+/g, "")
    .replace(/^SMTP_PASS\s*=\s*/i, "")
    .replace(/^["']|["']$/g, "");

  const customHost = process.env.SMTP_HOST?.trim();
  const customPort = Number(process.env.SMTP_PORT);

  // If a custom non-gmail host is configured, use standard SMTP transport
  if (customHost && customHost !== "smtp.gmail.com") {
    return nodemailer.createTransport({
      host: customHost,
      port: customPort || 587,
      secure: customPort === 465,
      auth: { user, pass },
      pool: false, // Must be false on serverless
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  // Standard Gmail configuration optimized for Vercel Serverless
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
    pool: false, // Fresh socket per serverless invocation
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Returns the sender 'from' header.
 * Formats nicely as: "NOIR Atelier <your_gmail@gmail.com>"
 */
export function getEmailFrom(): string {
  const customFrom = process.env.EMAIL_FROM?.trim();
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER)?.trim();

  if (customFrom) {
    return customFrom;
  }

  if (user) {
    return `NOIR Atelier <${user}>`;
  }

  return "NOIR Atelier <noreply@noir.studio>";
}
