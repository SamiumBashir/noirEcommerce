import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getMailTransporter, getEmailFrom } from "../src/lib/email/nodemailer";

async function verifyConnection() {
  console.log("==========================================");
  console.log(" 📧 TESTING GMAIL SMTP NODEMAILER SETUP");
  console.log("==========================================\n");

  const user = (process.env.SMTP_USER || process.env.GMAIL_USER)?.trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD)?.trim();
  const from = getEmailFrom();

  console.log("Sender Account:", user);
  console.log("From Header:", from);

  const transporter = getMailTransporter();
  if (!transporter) {
    console.error("❌ Failed to initialize Nodemailer transporter. Check .env.local");
    return;
  }

  try {
    console.log("Connecting & verifying with Gmail SMTP server...");
    await transporter.verify();
    console.log("✅ [SUCCESS] Gmail SMTP Server Connected & Authenticated!");

    // Test sending to 7232.badhan@gmail.com
    const testRecipient = "7232.badhan@gmail.com";
    console.log(`\nDispatching real test email to: ${testRecipient} ...`);
    const info = await transporter.sendMail({
      from,
      to: testRecipient,
      subject: "NOIR Atelier — Gmail SMTP Integration Verified",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 32px; background: #0c0c0c; color: #f5f3ef; border: 1px solid #222;">
          <h1 style="letter-spacing: 3px; font-size: 24px; text-transform: uppercase; margin-bottom: 8px;">NOIR ATELIER</h1>
          <p style="color: #c5a059; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">ATELIER NOTIFICATION SYSTEM</p>
          <hr style="border: none; border-top: 1px solid #222; margin: 20px 0;" />
          <p style="font-size: 14px; line-height: 1.6; color: #d0d0d0;">
            Congratulations! Your Gmail SMTP Nodemailer service is now active and delivering live emails to any user.
          </p>
          <p style="font-size: 12px; color: #888;">
            Sent securely via Gmail SMTP from ${user}.
          </p>
        </div>
      `,
    });
    console.log(`🎉 [SUCCESS] Live email delivered to ${testRecipient}! Message ID: ${info.messageId}`);
  } catch (err: any) {
    console.error("\n❌ [ERROR] Gmail SMTP connection failed:", err.message);
  }
}

verifyConnection().catch(console.error);
