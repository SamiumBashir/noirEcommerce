import { NextResponse } from "next/server";
import { getMailTransporter, getEmailFrom } from "@/lib/email/nodemailer";

export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint to verify Gmail SMTP connectivity directly on Vercel or locally.
 * Access via: https://your-site.vercel.app/api/auth/check-smtp
 */
export async function GET() {
  const user = (
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    process.env.MAIL_USER ||
    process.env.EMAIL_USER
  )?.trim();
  const pass = (
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASSWORD ||
    process.env.GMAIL_PASS ||
    process.env.MAIL_PASS ||
    process.env.MAIL_PASSWORD
  )?.trim();
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const from = getEmailFrom();

  const isConfigured = Boolean(user && pass && pass !== "your_gmail_app_password_here");

  if (!isConfigured) {
    return NextResponse.json(
      {
        status: "CONFIG_MISSING",
        message: "SMTP credentials are not found in this environment.",
        details: {
          smtpUserConfigured: Boolean(user),
          smtpPassConfigured: Boolean(pass),
          smtpHost: host,
          smtpPort: port,
          fromHeader: from,
        },
        instructions:
          "Go to Vercel Project Settings > Environment Variables, add SMTP_USER and SMTP_PASS, and redeploy.",
      },
      { status: 500 }
    );
  }

  const transporter = getMailTransporter();
  if (!transporter) {
    return NextResponse.json(
      {
        status: "INIT_FAILED",
        message: "Failed to initialize Nodemailer transporter.",
      },
      { status: 500 }
    );
  }

  try {
    await transporter.verify();
    return NextResponse.json(
      {
        status: "SUCCESS",
        message: "Gmail SMTP server connected and authenticated successfully on this server!",
        details: {
          smtpUser: user,
          fromHeader: from,
          environment: process.env.NODE_ENV || "unknown",
          platform: process.env.VERCEL ? "Vercel Serverless" : "Local / Custom",
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "AUTH_FAILED",
        message: err?.message || "Failed to authenticate with Gmail SMTP server.",
        details: {
          smtpUser: user,
          fromHeader: from,
          error: err?.message,
        },
        troubleshooting:
          "Verify that SMTP_PASS is a 16-character Google App Password (not your normal password), without extra spaces or variable names.",
      },
      { status: 500 }
    );
  }
}
