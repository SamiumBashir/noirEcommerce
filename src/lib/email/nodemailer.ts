import nodemailer, { Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

/**
 * Returns a configured Nodemailer Transporter instance for Gmail SMTP.
 * Supports standard Gmail App Password or custom SMTP host/port.
 * Returns null if credentials (SMTP_USER / SMTP_PASS) are missing.
 */
export function getMailTransporter(): Transporter | null {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER)?.trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD)?.trim();

  if (!user || !pass || pass === "your_gmail_app_password_here") {
    return null;
  }

  if (!cachedTransporter) {
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 465;
    const isSecure = port === 465;

    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure, // true for 465, false for 587
      auth: {
        user,
        pass: pass.replace(/\s+/g, ""), // Strip spaces from Gmail 16-character app passwords
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  return cachedTransporter;
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
