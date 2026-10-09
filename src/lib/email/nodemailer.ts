import nodemailer, { Transporter } from "nodemailer";

/**
 * Returns a configured Nodemailer Transporter instance for Gmail SMTP.
 * Fully optimized for serverless environments (Vercel Functions / AWS Lambda / Local):
 * - Direct SSL on Port 465 for reliable connection from cloud hosting datacenters
 * - No socket pooling to avoid stale/frozen TCP sockets after container freeze
 * - Automatic string sanitization to protect against quotes, spaces, or accidental variable names
 * - Built-in connection and socket timeouts to prevent hung requests
 */
export function getMailTransporter(): Transporter | null {
  const user = (
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    process.env.MAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.EMAIL ||
    process.env.USER_EMAIL
  )?.trim();

  let pass = (
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASSWORD ||
    process.env.GMAIL_PASS ||
    process.env.MAIL_PASS ||
    process.env.MAIL_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.APP_PASSWORD
  )?.trim();

  if (!user || !pass || pass === "your_gmail_app_password_here" || pass === "your_16_char_gmail_app_password") {
    return null;
  }

  // Sanitize: strip spaces (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop"), surrounding quotes, or accidental variable assignment prefix
  pass = pass
    .replace(/\s+/g, "")
    .replace(/^(SMTP_PASS|SMTP_PASSWORD|GMAIL_APP_PASSWORD|EMAIL_PASS|EMAIL_PASSWORD|APP_PASSWORD)\s*=\s*/i, "")
    .replace(/^["']|["']$/g, "");

  const customHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const customPort = Number(process.env.SMTP_PORT) || 465;

  return nodemailer.createTransport({
    host: customHost,
    port: customPort,
    secure: customPort === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    pool: false, // Fresh socket per serverless invocation
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

/**
 * Returns the sender 'from' header.
 * Formats nicely as: "NOIR Atelier <your_gmail@gmail.com>"
 */
export function getEmailFrom(): string {
  const customFrom = process.env.EMAIL_FROM?.trim();
  const user = (
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    process.env.MAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.EMAIL ||
    process.env.USER_EMAIL
  )?.trim();

  if (customFrom) {
    return customFrom;
  }

  if (user) {
    return `NOIR Atelier <${user}>`;
  }

  return "NOIR Atelier <noreply@noir.studio>";
}
