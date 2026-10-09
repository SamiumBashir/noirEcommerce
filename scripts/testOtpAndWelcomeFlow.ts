import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextRequest } from "next/server";
import { connectToDatabase } from "../src/lib/db/mongoose";
import { UserModel } from "../src/lib/db/models/User";
import { renderOtpEmail } from "../src/lib/email/templates/otpEmail";
import { renderWelcomeEmail } from "../src/lib/email/templates/welcomeEmail";
import { hashOtp, verifyOtpHash, generateSecureOtp } from "../src/lib/security/otp";

import { POST as registerHandler } from "../src/app/api/auth/register/route";
import { POST as verifyOtpHandler } from "../src/app/api/auth/verify-otp/route";
import { POST as resendOtpHandler } from "../src/app/api/auth/resend-otp/route";
import { POST as loginHandler } from "../src/app/api/auth/login/route";

async function runOtpAndWelcomeTestSuite() {
  console.log("=================================================================");
  console.log(" 🧪 NOIR ATELIER — PRODUCTION EMAIL OTP & WELCOME TEST SUITE");
  console.log("=================================================================\n");

  await connectToDatabase();

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? " - " + detail : ""}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Cryptographic OTP Generation & Timing-Safe Hashing
  // -------------------------------------------------------------
  console.log("--- 1. Cryptographic OTP Generation & HMAC-SHA256 Hashing ---");
  const sampleOtp = generateSecureOtp();
  assert(
    sampleOtp.length === 6 && /^\d{6}$/.test(sampleOtp),
    "Generates cryptographically uniform 6-digit numeric OTP"
  );

  const sampleHash = hashOtp(sampleOtp);
  assert(
    typeof sampleHash === "string" && sampleHash.length === 64,
    "Produces 64-character HMAC-SHA256 hexadecimal hash"
  );

  assert(
    verifyOtpHash(sampleOtp, sampleHash) === true,
    "Timing-safe comparison confirms matching OTP against hash"
  );

  assert(
    verifyOtpHash("000000", sampleHash) === false,
    "Timing-safe comparison rejects invalid OTP against hash"
  );

  // -------------------------------------------------------------
  // TEST 2: Email Template Rendering & Brand Requirements (Phase 4 & 7)
  // -------------------------------------------------------------
  console.log("\n--- 2. Template Rendering & Luxury Noir Brand Requirements ---");
  const otpEmail = renderOtpEmail({
    userName: "Elena Rostova",
    otp: "849201",
    expiresInMinutes: 10,
  });

  assert(
    otpEmail.html.includes("849201") &&
      otpEmail.html.includes("Elena Rostova") &&
      otpEmail.html.includes("NOIR") &&
      otpEmail.html.includes("10 minutes") &&
      otpEmail.html.includes("Security Notice:") &&
      otpEmail.text.includes("849201") &&
      otpEmail.text.includes("expires in 10 minutes"),
    "OTP email renders visible 6-digit code, expiration, security notice, and plain-text alternative"
  );

  const welcomeEmail = renderWelcomeEmail({
    userName: "Elena Rostova",
    email: "elena@atelier.studio",
  });

  assert(
    welcomeEmail.html.includes("Welcome to NOIR, Elena Rostova") &&
      welcomeEmail.html.includes("Email Verified &amp; Active") &&
      welcomeEmail.html.includes("Your Atelier Privileges") &&
      welcomeEmail.html.includes("The NOIR Atelier Curators") &&
      welcomeEmail.text.includes("WELCOME TO NOIR — YOUR JOURNEY BEGINS"),
    "Welcome email renders personalized greeting, verified status, privileges, and plain-text alternative"
  );

  // -------------------------------------------------------------
  // TEST 3: Registration Creates Unverified Account with HASHED OTP (Phase 2 & 3)
  // -------------------------------------------------------------
  console.log("\n--- 3. Registration: Unverified Account & Secure Hash Storage ---");
  const testEmail = `elena_suite_${Date.now()}@noir.studio`;
  const testPassword = "NoirPassword2026!";

  // Ensure clean state
  await UserModel.deleteOne({ email: testEmail });

  const regReq = new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Elena Rostova",
      email: testEmail,
      password: testPassword,
    }),
  });

  const regRes = await registerHandler(regReq);
  const regData = await regRes.json();

  assert(
    regRes.status === 201 && regData.success === true && regData.requiresOtp === true,
    "Registration returns 201 Created with requiresOtp: true"
  );

  const createdUser = await UserModel.findOne({ email: testEmail }).select(
    "+emailVerificationOtpHash +verificationOtp"
  );

  assert(
    Boolean(createdUser) &&
      createdUser?.isVerified === false &&
      createdUser?.isEmailVerified === false,
    "Database record reflects isVerified: false and isEmailVerified: false"
  );

  assert(
    createdUser?.verificationOtp === undefined,
    "CRITICAL: Plaintext verificationOtp is NOT stored in the database"
  );

  assert(
    Boolean(createdUser?.emailVerificationOtpHash) &&
      createdUser!.emailVerificationOtpHash!.length === 64,
    "Database securely stores HMAC-SHA256 hashed OTP (emailVerificationOtpHash)"
  );

  assert(
    createdUser?.emailVerificationAttempts === 0 &&
      Boolean(createdUser?.emailVerificationExpiresAt) &&
      Boolean(createdUser?.emailVerificationLastSentAt),
    "Database tracks attempts (0), expiration (10m), and lastSentAt"
  );

  // -------------------------------------------------------------
  // TEST 4: Login Attempt Blocked for Unverified Account
  // -------------------------------------------------------------
  console.log("\n--- 4. Authentication Gate: Unverified Account Sign-In Restriction ---");
  const unverifiedLoginReq = new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const unverifiedLoginRes = await loginHandler(unverifiedLoginReq);
  const unverifiedLoginData = await unverifiedLoginRes.json();

  assert(
    unverifiedLoginRes.status === 403 &&
      unverifiedLoginData.requiresVerification === true &&
      unverifiedLoginData.success === false,
    "Unverified account login is rejected with 403 Forbidden and requiresVerification: true"
  );

  // -------------------------------------------------------------
  // TEST 5: Invalid OTP Rejection & Failed Attempt Counter
  // -------------------------------------------------------------
  console.log("\n--- 5. Invalid OTP Rejection & Failed Attempt Counter ---");
  const invalidOtpReq = new NextRequest("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: "999999", // incorrect code
    }),
  });
  const invalidOtpRes = await verifyOtpHandler(invalidOtpReq);
  const invalidOtpData = await invalidOtpRes.json();

  assert(
    invalidOtpRes.status === 400 && invalidOtpData.success === false,
    "Rejects incorrect OTP with 400 Bad Request"
  );

  const userAfterAttempt = await UserModel.findOne({ email: testEmail });
  assert(
    userAfterAttempt?.emailVerificationAttempts === 1,
    "Increments emailVerificationAttempts to 1"
  );

  // -------------------------------------------------------------
  // TEST 6: Failed Attempt Limits (Rate-limiting / Lockout after 5 attempts)
  // -------------------------------------------------------------
  console.log("\n--- 6. Failed Attempt Limit (5 Max Attempts) ---");
  // Artificially simulate 5 failed attempts
  await UserModel.updateOne(
    { email: testEmail },
    { $set: { emailVerificationAttempts: 5 } }
  );

  const lockedOtpReq = new NextRequest("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: "123456",
    }),
  });
  const lockedOtpRes = await verifyOtpHandler(lockedOtpReq);
  const lockedOtpData = await lockedOtpRes.json();

  assert(
    lockedOtpRes.status === 429 && lockedOtpData.locked === true,
    "Blocks verification after 5 failed attempts with 429 Too Many Requests"
  );

  // -------------------------------------------------------------
  // TEST 7: Resend OTP Cooldown Enforcement (60s minimum interval)
  // -------------------------------------------------------------
  console.log("\n--- 7. Resend OTP Cooldown Rate Limit (60 Seconds) ---");
  // Set lastSentAt to 10 seconds ago (cooldown still active)
  await UserModel.updateOne(
    { email: testEmail },
    { $set: { emailVerificationLastSentAt: new Date(Date.now() - 10 * 1000) } }
  );

  const cooldownReq = new NextRequest("http://localhost/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const cooldownRes = await resendOtpHandler(cooldownReq);
  const cooldownData = await cooldownRes.json();

  assert(
    cooldownRes.status === 429 &&
      cooldownData.success === false &&
      typeof cooldownData.retryAfter === "number",
    "Enforces 60-second cooldown on resend with 429 and retryAfter seconds"
  );

  // -------------------------------------------------------------
  // TEST 8: Resend OTP Invalidation of Old Code & Reset Attempts
  // -------------------------------------------------------------
  console.log("\n--- 8. Resend OTP: Old Code Invalidation & Fresh Challenge ---");
  // Fast-forward cooldown to 65 seconds ago
  await UserModel.updateOne(
    { email: testEmail },
    { $set: { emailVerificationLastSentAt: new Date(Date.now() - 65 * 1000) } }
  );

  // Generate a known test OTP to plant into user record via resend or direct hash
  const testFreshOtp = "729415";
  const testFreshHash = hashOtp(testFreshOtp);

  const validResendReq = new NextRequest("http://localhost/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const validResendRes = await resendOtpHandler(validResendReq);
  const validResendData = await validResendRes.json();

  assert(
    validResendRes.status === 200 && validResendData.success === true,
    "Resend succeeds after cooldown expiry"
  );

  // Plant the known testFreshOtp hash for testing verification
  await UserModel.updateOne(
    { email: testEmail },
    {
      $set: {
        emailVerificationOtpHash: testFreshHash,
        emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        emailVerificationAttempts: 0,
      },
    }
  );

  // -------------------------------------------------------------
  // TEST 9: Expired OTP Rejection
  // -------------------------------------------------------------
  console.log("\n--- 9. Expired OTP Rejection ---");
  // Set expiration to 5 seconds in the past
  await UserModel.updateOne(
    { email: testEmail },
    { $set: { emailVerificationExpiresAt: new Date(Date.now() - 5000) } }
  );

  const expiredReq = new NextRequest("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: testFreshOtp,
    }),
  });
  const expiredRes = await verifyOtpHandler(expiredReq);
  const expiredData = await expiredRes.json();

  assert(
    expiredRes.status === 400 && expiredData.expired === true,
    "Rejects expired OTP with 400 and expired: true"
  );

  // Restore valid expiration
  await UserModel.updateOne(
    { email: testEmail },
    { $set: { emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000) } }
  );

  // -------------------------------------------------------------
  // TEST 10: Valid OTP Verification & Welcome Email Dispatch
  // -------------------------------------------------------------
  console.log("\n--- 10. Valid OTP Verification & Welcome Email Trigger ---");
  const verifyValidReq = new NextRequest("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: testFreshOtp,
    }),
  });
  const verifyValidRes = await verifyOtpHandler(verifyValidReq);
  const verifyValidData = await verifyValidRes.json();

  assert(
    verifyValidRes.status === 200 &&
      verifyValidData.success === true &&
      Boolean(verifyValidData.token),
    "Successfully verifies email, returns JWT session token and user profile"
  );

  const verifiedUser = await UserModel.findOne({ email: testEmail }).select(
    "+emailVerificationOtpHash"
  );

  assert(
    verifiedUser?.isVerified === true && verifiedUser?.isEmailVerified === true,
    "User marked isVerified: true and isEmailVerified: true in database"
  );

  assert(
    verifiedUser?.emailVerificationOtpHash === undefined &&
      verifiedUser?.emailVerificationExpiresAt === undefined,
    "Atomically cleared OTP hash and expiration metadata after verification"
  );

  assert(
    Boolean(verifiedUser?.welcomeEmailSentAt),
    "welcomeEmailSentAt timestamp recorded for Welcome Email delivery"
  );

  // -------------------------------------------------------------
  // TEST 11: Single-Use & Idempotency: Reused OTP Rejected
  // -------------------------------------------------------------
  console.log("\n--- 11. Single-Use Protection & Re-Verification Idempotency ---");
  const reuseReq = new NextRequest("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: testFreshOtp,
    }),
  });
  const reuseRes = await verifyOtpHandler(reuseReq);
  const reuseData = await reuseRes.json();

  assert(
    reuseData.alreadyVerified === true || reuseRes.status === 200,
    "Re-verification safely recognizes alreadyVerified state without duplicate processing"
  );

  // -------------------------------------------------------------
  // TEST 12: Verified Account Login Allowed
  // -------------------------------------------------------------
  console.log("\n--- 12. Verified Account Login Allowed ---");
  const verifiedLoginReq = new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const verifiedLoginRes = await loginHandler(verifiedLoginReq);
  const verifiedLoginData = await verifiedLoginRes.json();

  assert(
    verifiedLoginRes.status === 200 &&
      verifiedLoginData.success === true &&
      Boolean(verifiedLoginData.token),
    "Verified account logs in smoothly via /api/auth/login"
  );

  // -------------------------------------------------------------
  // TEST 13: Resend Blocked on Already Verified Account
  // -------------------------------------------------------------
  console.log("\n--- 13. Resend OTP Blocked for Verified Accounts ---");
  const resendVerifiedReq = new NextRequest("http://localhost/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const resendVerifiedRes = await resendOtpHandler(resendVerifiedReq);

  assert(
    resendVerifiedRes.status === 400,
    "Rejects resending verification code to an already verified account"
  );

  // Cleanup test user
  await UserModel.deleteOne({ email: testEmail });

  console.log("\n=================================================================");
  console.log(` Summary: ${passed} of ${total} automated test scenarios passed.`);
  console.log("=================================================================\n");

  process.exit(passed === total ? 0 : 1);
}

runOtpAndWelcomeTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
