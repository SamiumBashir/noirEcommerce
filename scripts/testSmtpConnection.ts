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

  console.log("Sender Email:", user || "(none)");
  console.log("App Password configured?", !!pass && pass !== "your_gmail_app_password_here");
  console.log("From Header:", from);

  if (!user || !pass || pass === "your_gmail_app_password_here") {
    console.log("\n⚠️  Gmail App Password is not yet set in .env.local.");
    console.log("   Steps to configure:");
    console.log("   1. Go to https://myaccount.google.com/apppasswords");
    console.log("   2. Generate an App Password for 'Mail'");
    console.log("   3. Paste the 16-character password into SMTP_PASS in .env.local");
    return;
  }

  const transporter = getMailTransporter();
  if (!transporter) {
    console.error("❌ Failed to initialize Nodemailer transporter.");
    return;
  }

  try {
    console.log("\nConnecting to Gmail SMTP server (smtp.gmail.com:465)...");
    await transporter.verify();
    console.log("✅ [SUCCESS] Gmail SMTP Authentication Verified successfully!");

    console.log("\nSending a test email to your Gmail address...");
    const info = await transporter.sendMail({
      from,
      to: user,
      subject: "NOIR Atelier — Gmail SMTP Integration Successful",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #000; color: #fff;">
          <h2 style="letter-spacing: 2px;">NOIR ATELIER</h2>
          <p>Congratulations! Your Gmail SMTP Nodemailer service is now active and delivering live emails to any user.</p>
        </div>
      `,
    });
    console.log(`✅ [SUCCESS] Test email delivered! Message ID: ${info.messageId}`);
  } catch (err: any) {
    console.error("\n❌ [ERROR] Gmail SMTP connection failed:", err.message);
    if (err.message.includes("Username and Password not accepted") || err.message.includes("535")) {
      console.log("\n💡 TIP: Gmail requires an 'App Password', not your regular Gmail login password.");
      console.log("   Create one at https://myaccount.google.com/apppasswords (requires 2-Step Verification enabled).");
    }
  }
}

verifyConnection().catch(console.error);
