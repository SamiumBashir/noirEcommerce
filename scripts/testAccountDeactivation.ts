import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectToDatabase } from "../src/lib/db/mongoose";
import { UserModel, hashPassword } from "../src/lib/db/models/User";
import { renderDeactivationEmail } from "../src/lib/email/templates/deactivationEmail";
import { sendDeactivationEmail } from "../src/lib/email/sendDeactivationEmail";

async function runDeactivationTestSuite() {
  console.log("=================================================");
  console.log(" 🧪 NOIR ATELIER - ACCOUNT DEACTIVATION TEST SUITE");
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

  // TEST 1: Email Template Rendering & Structure
  console.log("--- Test 1: Deactivation Email Template Rendering ---");
  const rendered = renderDeactivationEmail({
    userName: "Julian Delacroix",
    email: "julian@noir.studio",
    deactivatedAt: "Wednesday, October 7, 2026 at 6:00 AM UTC",
    reason: "Taking a temporary break from luxury purchasing",
  });

  assert(
    rendered.html.toLowerCase().includes("account deactivated") &&
      rendered.html.includes("Julian Delacroix") &&
      rendered.html.includes("julian@noir.studio") &&
      rendered.html.includes("Taking a temporary break") &&
      rendered.html.includes("NOIR ATELIER") &&
      rendered.text.toLowerCase().includes("account deactivated"),
    "Deactivation email template renders HTML and plaintext correctly with luxury branding"
  );

  // TEST 2: User Model Schema Properties
  console.log("\n--- Test 2: User Schema Fields ---");
  const testEmail = `test-deact-${Date.now()}@noir-atelier.test`;
  const rawPassword = "PatronSecretPassword2026!";
  const hashedPassword = await hashPassword(rawPassword);

  // Clean up any stale user
  await UserModel.deleteOne({ email: testEmail });

  const testUser = await UserModel.create({
    name: "Julian Delacroix",
    email: testEmail,
    password: hashedPassword,
    role: "customer",
    isEmailVerified: true,
    isActive: true,
  });

  assert(testUser.isActive === true, "New user starts with isActive = true");

  // TEST 3: Password Verification on Deactivation
  console.log("\n--- Test 3: Password Verification Security ---");
  const wrongPasswordMatch = await testUser.comparePassword("WrongPassword123!");
  assert(!wrongPasswordMatch, "Reject deactivation when incorrect password provided");

  const correctPasswordMatch = await testUser.comparePassword(rawPassword);
  assert(correctPasswordMatch, "Validate deactivation when correct password provided");

  // TEST 4: Execute Deactivation Update
  console.log("\n--- Test 4: Account Deactivation State Persistence ---");
  const deactivationReason = "Taking a temporary break";
  testUser.isActive = false;
  testUser.deactivatedAt = new Date();
  testUser.deactivationReason = deactivationReason;
  await testUser.save();

  const refreshedUser = await UserModel.findOne({ email: testEmail });
  assert(refreshedUser !== null && refreshedUser.isActive === false, "User isActive is flipped to false");
  assert(refreshedUser?.deactivatedAt instanceof Date, "deactivatedAt timestamp is recorded in database");
  assert(refreshedUser?.deactivationReason === deactivationReason, "deactivationReason is properly saved");

  // TEST 5: Verify Login Block for Deactivated Users
  console.log("\n--- Test 5: Inactive User Login Block Enforcement ---");
  // Check that the user cannot log in
  const userAttempt = await UserModel.findOne({ email: testEmail }).select("+password");
  assert(userAttempt !== null, "Found test user record");
  if (userAttempt) {
    const isAllowed = userAttempt.isActive;
    assert(!isAllowed, "Deactivated account is denied access (isActive is false)");
  }

  // TEST 6: Email Delivery
  console.log("\n--- Test 6: Deactivation Email Dispatch ---");
  const testRecipient = (process.env.SMTP_USER || process.env.GMAIL_USER || "samiumbashirbosunia@gmail.com").trim();
  const emailResult = await sendDeactivationEmail({
    email: testRecipient,
    name: testUser.name,
    reason: deactivationReason,
  });
  assert(
    typeof emailResult === "object" && emailResult.success === true,
    "sendDeactivationEmail dispatches successfully via SMTP / Dev Mode"
  );

  // CLEANUP
  await UserModel.deleteOne({ email: testEmail });
  console.log("\n🧹 Test user cleaned up.");

  console.log("\n=================================================");
  console.log(` 📊 SUMMARY: ${passedTests}/${totalTests} tests passed`);
  console.log("=================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runDeactivationTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
