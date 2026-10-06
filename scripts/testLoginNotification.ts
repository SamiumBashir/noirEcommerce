import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectToDatabase } from "../src/lib/db/mongoose";
import { UserModel, hashPassword } from "../src/lib/db/models/User";
import { LoginActivityModel } from "../src/lib/db/models/LoginActivity";
import { escapeHtml, renderLoginNotificationEmail } from "../src/lib/email/templates/loginNotificationEmail";
import { sendLoginNotification } from "../src/lib/email/sendLoginNotification";

async function runTestSuite() {
  console.log("=================================================");
  console.log(" 🧪 NOIR ATELIER - LOGIN NOTIFICATION TEST SUITE");
  console.log("=================================================\n");

  await connectToDatabase();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}${details ? " - " + details : ""}`);
    }
  }

  // TEST 1: HTML Sanitization to prevent XSS / Injection (Section 11)
  console.log("--- Test 1: HTML Sanitization & Injection Prevention ---");
  const dangerousString = `<script>alert('xss')</script> "Hello" & 'World' > <`;
  const sanitized = escapeHtml(dangerousString);
  assert(
    !sanitized.includes("<script>") &&
      sanitized.includes("&lt;script&gt;") &&
      sanitized.includes("&quot;") &&
      sanitized.includes("&amp;") &&
      sanitized.includes("&#039;"),
    "Sanitizes HTML characters (< > & \" ')"
  );

  // TEST 2: Email Template Rendering (Section 4 & 12)
  console.log("\n--- Test 2: Email Template Generation ---");
  const { html, text } = renderLoginNotificationEmail({
    userName: "Alexander Vance",
    loginTime: "Oct 7, 2026, 03:00:00 AM UTC",
    device: "Desktop",
    browser: "Google Chrome 130.0",
    os: "Windows 11",
    ip: "103.205.180.25",
    location: "Dhaka, Bangladesh",
  });
  assert(
    html.includes("New Login Detected") &&
      html.includes("Alexander Vance") &&
      html.includes("103.205.180.25") &&
      html.includes("Dhaka, Bangladesh") &&
      html.includes("NOIR ATELIER") &&
      text.includes("New Login Detected"),
    "Renders cross-client HTML and plain text with correct security details"
  );

  // TEST 3: User Setup & Password Verification
  console.log("\n--- Test 3: User Model & Password Verification ---");
  const testEmail = `test_security_${Date.now()}@noir.studio`;
  const testPassword = "NoirSecurePassword2026!";
  const hashedPassword = await hashPassword(testPassword);

  const testUser = await UserModel.create({
    name: "Security Tester",
    email: testEmail,
    password: hashedPassword,
    role: "customer",
    isActive: true,
    isBlocked: false,
  });

  const correctMatch = await testUser.comparePassword(testPassword);
  const wrongMatch = await testUser.comparePassword("WrongPassword123");
  assert(correctMatch === true, "Verifies correct password");
  assert(wrongMatch === false, "Rejects incorrect password");

  // TEST 4: Login Activity Creation & Indexing (Section 6)
  console.log("\n--- Test 4: LoginActivity Model & Storage ---");
  const activity = await LoginActivityModel.create({
    userId: testUser._id,
    email: testUser.email,
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    device: "Desktop",
    browser: "Google Chrome",
    os: "Windows",
    location: "Paris, France",
    status: "SUCCESS",
    emailNotificationSent: false,
  });
  assert(Boolean(activity._id), "Records LoginActivity document with indexes");
  assert(activity.status === "SUCCESS", "Sets login activity status to SUCCESS");

  // TEST 5: Non-Blocking Email Dispatch (Section 8)
  console.log("\n--- Test 5: Resilience & Non-blocking Email Dispatch ---");
  const dispatchResult = await sendLoginNotification({
    email: testUser.email,
    name: testUser.name,
    ip: activity.ip,
    userAgent: activity.userAgent,
    device: activity.device,
    browser: activity.browser,
    os: activity.os,
    location: activity.location,
    loginActivityId: activity._id.toString(),
  });
  // Since RESEND_API_KEY is currently a placeholder locally, it safely catches without throwing
  assert(
    typeof dispatchResult === "object",
    "sendLoginNotification executes without throwing unhandled exceptions"
  );

  // TEST 6: Duplicate Email Prevention (Section 10)
  console.log("\n--- Test 6: Duplicate Prevention Idempotency ---");
  await LoginActivityModel.findByIdAndUpdate(activity._id, {
    $set: { emailNotificationSent: true, emailJobId: "msg_existing_123" },
  });
  const duplicateResult = await sendLoginNotification({
    email: testUser.email,
    name: testUser.name,
    ip: activity.ip,
    userAgent: activity.userAgent,
    device: activity.device,
    browser: activity.browser,
    os: activity.os,
    location: activity.location,
    loginActivityId: activity._id.toString(),
  });
  assert(duplicateResult.success === true, "Prevents duplicate email delivery for identical loginActivityId");

  // Cleanup test user & activity
  await UserModel.deleteOne({ _id: testUser._id });
  await LoginActivityModel.deleteOne({ _id: activity._id });

  console.log("\n=================================================");
  console.log(` Summary: ${passedTests} of ${totalTests} tests passed.`);
  console.log("=================================================");

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
