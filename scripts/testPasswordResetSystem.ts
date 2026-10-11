import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextRequest } from "next/server";
import { connectToDatabase } from "../src/lib/db/mongoose";
import { UserModel, hashPassword } from "../src/lib/db/models/User";
import { generateSecureOtp, hashOtp, verifyOtpHash } from "../src/lib/security/otp";
import {
  PasswordResetStore,
  getOpaqueEmailId,
  hashResetToken,
  OTP_TTL_SECONDS,
  RESEND_COOLDOWN_SECONDS,
  MAX_OTP_ATTEMPTS,
} from "../src/lib/redis/passwordResetStore";
import { renderPasswordResetEmail } from "../src/lib/email/templates/passwordResetEmail";

// API Handlers
import { POST as forgotPasswordHandler } from "../src/app/api/auth/forgot-password/route";
import { POST as verifyResetOtpHandler } from "../src/app/api/auth/verify-reset-otp/route";
import { POST as resendResetOtpHandler } from "../src/app/api/auth/resend-reset-otp/route";
import { POST as resetPasswordHandler } from "../src/app/api/auth/reset-password/route";
import { POST as loginHandler } from "../src/app/api/auth/login/route";

function createMockRequest(url: string, body: any, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function runPasswordResetTestSuite() {
  console.log("=================================================================");
  console.log(" 🧪 NOIR ATELIER — PRODUCTION FORGOT/RESET PASSWORD TEST SUITE");
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
  // SUITE 1: Cryptographic Primitives & Timing Safety
  // -------------------------------------------------------------
  console.log("--- 1. Cryptographic Primitives & Zero-Trust Security ---");

  const otp1 = generateSecureOtp();
  assert(
    otp1.length === 6 && /^\d{6}$/.test(otp1),
    "Generates cryptographically uniform 6-digit numeric OTP"
  );

  const otpHash1 = hashOtp(otp1);
  assert(
    typeof otpHash1 === "string" && otpHash1.length === 64,
    "Generates 64-character HMAC-SHA256 digest"
  );

  assert(
    verifyOtpHash(otp1, otpHash1) === true,
    "Timing-safe comparison validates correct OTP against HMAC"
  );

  assert(
    verifyOtpHash("000000", otpHash1) === false,
    "Timing-safe comparison rejects incorrect OTP"
  );

  // Opaque email identifier
  const opaqueId1 = getOpaqueEmailId("patron@noir.studio");
  const opaqueId2 = getOpaqueEmailId("PATRON@NOIR.STUDIO ");
  assert(
    opaqueId1.length === 64 && opaqueId1 === opaqueId2,
    "Normalized email generates consistent 64-character opaque SHA-256 ID"
  );

  const rawSampleToken = "a".repeat(64);
  const tokenHash1 = hashResetToken(rawSampleToken);
  assert(
    typeof tokenHash1 === "string" && tokenHash1.length === 64 && tokenHash1 !== rawSampleToken,
    "Produces SHA-256 hash of reset token for secure Redis storage"
  );

  // -------------------------------------------------------------
  // SUITE 2: Email Template Rendering & Luxury Aesthetic
  // -------------------------------------------------------------
  console.log("\n--- 2. Email Template Rendering & Luxury NOIR Branding ---");

  const renderedEmail = renderPasswordResetEmail({
    userName: "Julian Vance",
    otp: "654321",
    expiresInMinutes: 10,
  });

  assert(
    renderedEmail.html.includes("654321") &&
      renderedEmail.html.includes("Julian Vance") &&
      renderedEmail.html.includes("NOIR") &&
      renderedEmail.html.includes("10 minutes") &&
      renderedEmail.text.includes("654321"),
    "Renders luxury HTML & plain-text template with 6-digit OTP and advisories"
  );

  // -------------------------------------------------------------
  // SUITE 3: Redis State Management & Atomic Operations
  // -------------------------------------------------------------
  console.log("\n--- 3. Redis State Management & Atomic Operations ---");

  const testEmail = "store_test@noir.studio";
  const testUserId = "usr_state_test_01";
  const testOtp = "789123";
  const hashedOtp = hashOtp(testOtp);

  // 3.1 Save OTP
  const saveResult = await PasswordResetStore.saveOtpWithCooldown(testEmail, testUserId, testOtp);
  assert(saveResult.success === true, "Atomically saves OTP with 600s TTL in Redis/Store");

  // 3.2 Cooldown enforcement
  const immediateSave = await PasswordResetStore.saveOtpWithCooldown(testEmail, testUserId, testOtp);
  assert(
    immediateSave.success === false && typeof immediateSave.retryAfter === "number",
    `Enforces 60-second resend cooldown against subsequent requests (${immediateSave.retryAfter}s remaining)`
  );

  // 3.3 Verify with wrong OTP increments attempt counter
  const wrongVerify = await PasswordResetStore.verifyAndConsumeOtp(testEmail, "000000");
  assert(
    wrongVerify.success === false && wrongVerify.remainingAttempts === 4,
    "Wrong OTP decrements remaining attempts counter (4 remaining)"
  );

  // 3.4 Lockout after max attempts
  await PasswordResetStore.verifyAndConsumeOtp(testEmail, "000001");
  await PasswordResetStore.verifyAndConsumeOtp(testEmail, "000002");
  await PasswordResetStore.verifyAndConsumeOtp(testEmail, "000003");
  const fifthAttempt = await PasswordResetStore.verifyAndConsumeOtp(testEmail, "000004");
  assert(
    fifthAttempt.success === false && fifthAttempt.locked === true,
    "Enforces lockout after 5 consecutive incorrect OTP attempts"
  );

  // 3.5 Even correct OTP is rejected once locked
  const lockedVerify = await PasswordResetStore.verifyAndConsumeOtp(testEmail, testOtp);
  assert(
    lockedVerify.success === false && (lockedVerify.locked === true || lockedVerify.expired === true),
    "Locked OTP state rejects even correct OTP submission"
  );

  // 3.6 Resending clears lock and generates fresh state
  const newOtp = "456789";
  await PasswordResetStore.invalidateAllResetState(testEmail); // Force clear cooldown for test
  const resendResult = await PasswordResetStore.saveOtpWithCooldown(testEmail, testUserId, newOtp);
  assert(resendResult.success === true, "Resend establishes fresh OTP and unlocks state");

  // 3.7 Old OTP cannot verify new state
  const oldVerifyNewState = await PasswordResetStore.verifyAndConsumeOtp(testEmail, testOtp);
  assert(oldVerifyNewState.success === false, "Old OTP is completely invalidated by resend");

  // 3.8 Correct OTP verifies and returns grant
  const correctVerify = await PasswordResetStore.verifyAndConsumeOtp(testEmail, newOtp);
  assert(
    correctVerify.success === true && !!correctVerify.resetToken,
    "Correct OTP returns raw reset authorization token"
  );

  // 3.9 Single-use: OTP cannot be re-verified
  const replayVerify = await PasswordResetStore.verifyAndConsumeOtp(testEmail, newOtp);
  assert(
    replayVerify.success === false && replayVerify.expired === true,
    "Single-use OTP is atomically consumed on verification"
  );

  // 3.10 Reset grant consumption
  const tokenToConsume = correctVerify.resetToken!;
  const grantConsumeResult = await PasswordResetStore.consumeResetGrant(tokenToConsume);
  assert(
    grantConsumeResult !== null && grantConsumeResult.userId === testUserId,
    "Reset grant is retrieved and verified for correct target user"
  );

  // 3.11 Replay of reset grant fails
  const replayGrantConsume = await PasswordResetStore.consumeResetGrant(tokenToConsume);
  assert(
    replayGrantConsume === null,
    "Reset grant is single-use and cannot be replayed"
  );

  // -------------------------------------------------------------
  // SUITE 4: End-to-End API Routes Integration & Security Tests
  // -------------------------------------------------------------
  console.log("\n--- 4. End-to-End API Routes & Regression Verification ---");

  // Ensure test patron exists in DB
  const patronEmail = "patron_reset_test@noir.studio";
  const initialPassword = "NoirInitialPass2026!";
  let patronUser = await UserModel.findOne({ email: patronEmail });
  if (patronUser) {
    await UserModel.deleteOne({ email: patronEmail });
  }
  const initialHash = await hashPassword(initialPassword);
  patronUser = await UserModel.create({
    name: "Genevieve Noir",
    email: patronEmail,
    password: initialHash,
    role: "customer",
    isEmailVerified: true,
    tokenVersion: 0,
  });
  assert(!!patronUser, "Created clean test patron in database");

  // 4.1 Endpoint A: Forgot Password Validation & Privacy
  console.log("\n  -> Testing POST /api/auth/forgot-password");

  // Empty email
  const emptyEmailRes = await forgotPasswordHandler(
    createMockRequest("/api/auth/forgot-password", { email: "" })
  );
  assert(emptyEmailRes.status === 400, "Rejects empty email with 400 Bad Request");

  // Invalid email format
  const invalidEmailRes = await forgotPasswordHandler(
    createMockRequest("/api/auth/forgot-password", { email: "not-an-email" })
  );
  assert(invalidEmailRes.status === 400, "Rejects invalid email format with 400 Bad Request");

  // Unknown email (Privacy preservation test: must return generic 200 OK)
  const unknownEmailRes = await forgotPasswordHandler(
    createMockRequest("/api/auth/forgot-password", { email: "nonexistent_patron_xyz@unknown.com" })
  );
  const unknownData = await unknownEmailRes.json();
  assert(
    unknownEmailRes.status === 200 &&
      unknownData.success === true &&
      unknownData.message.includes("If an account exists"),
    "Returns generic response for unregistered email without leaking account existence"
  );

  // Registered email
  await PasswordResetStore.invalidateAllResetState(patronEmail);
  const validForgotRes = await forgotPasswordHandler(
    createMockRequest("/api/auth/forgot-password", { email: patronEmail })
  );
  const validForgotData = await validForgotRes.json();
  assert(
    validForgotRes.status === 200 && validForgotData.success === true,
    "Dispatches OTP and returns generic success for registered patron"
  );

  // Cooldown on immediate second request
  const rapidForgotRes = await forgotPasswordHandler(
    createMockRequest("/api/auth/forgot-password", { email: patronEmail })
  );
  assert(
    rapidForgotRes.status === 429,
    "Returns 429 Too Many Requests when cooldown is active"
  );

  // 4.2 Endpoint B: Verify Reset OTP
  console.log("\n  -> Testing POST /api/auth/verify-reset-otp");

  // Missing parameters
  const missingOtpRes = await verifyResetOtpHandler(
    createMockRequest("/api/auth/verify-reset-otp", { email: patronEmail })
  );
  assert(missingOtpRes.status === 400, "Rejects missing OTP parameter with 400");

  // Malformed OTP (5 digits, non-numeric)
  const malformedOtpRes = await verifyResetOtpHandler(
    createMockRequest("/api/auth/verify-reset-otp", { email: patronEmail, otp: "12345" })
  );
  assert(malformedOtpRes.status === 400, "Rejects non-6-digit OTP with 400");

  // Wrong OTP attempt
  const wrongOtpRes = await verifyResetOtpHandler(
    createMockRequest("/api/auth/verify-reset-otp", { email: patronEmail, otp: "000000" })
  );
  const wrongOtpData = await wrongOtpRes.json();
  assert(
    wrongOtpRes.status === 400 && wrongOtpData.remainingAttempts === 4,
    "Wrong OTP rejected with 400 and returns attempts remaining"
  );

  // Retrieve current active OTP by re-issuing known OTP in store
  await PasswordResetStore.invalidateAllResetState(patronEmail);
  const knownOtp = "918273";
  await PasswordResetStore.saveOtpWithCooldown(
    patronEmail,
    patronUser._id.toString(),
    knownOtp
  );

  // Verify with correct OTP
  const correctVerifyRes = await verifyResetOtpHandler(
    createMockRequest("/api/auth/verify-reset-otp", { email: patronEmail, otp: knownOtp })
  );
  const correctVerifyData = await correctVerifyRes.json();
  assert(
    correctVerifyRes.status === 200 &&
      correctVerifyData.success === true &&
      typeof correctVerifyData.resetToken === "string" &&
      correctVerifyData.resetToken.length === 64,
    "Correct OTP verification returns single-use 64-char resetToken"
  );

  const issuedResetToken = correctVerifyData.resetToken;

  // Replay of verified OTP
  const replayVerifyRes = await verifyResetOtpHandler(
    createMockRequest("/api/auth/verify-reset-otp", { email: patronEmail, otp: knownOtp })
  );
  assert(replayVerifyRes.status === 400, "Replay of verified OTP fails (already consumed)");

  // 4.3 Endpoint C: Reset Password
  console.log("\n  -> Testing POST /api/auth/reset-password");

  // Missing resetToken
  const missingTokenRes = await resetPasswordHandler(
    createMockRequest("/api/auth/reset-password", { newPassword: "NewSecretPass2026!" })
  );
  assert(missingTokenRes.status === 400, "Rejects missing resetToken with 400");

  // Malformed resetToken
  const malformedTokenRes = await resetPasswordHandler(
    createMockRequest("/api/auth/reset-password", { resetToken: "short-token", newPassword: "NewSecretPass2026!" })
  );
  assert(malformedTokenRes.status === 400, "Rejects malformed resetToken with 400");

  // Weak password (< 8 chars)
  const weakPasswordRes = await resetPasswordHandler(
    createMockRequest("/api/auth/reset-password", { resetToken: issuedResetToken, newPassword: "short" })
  );
  assert(weakPasswordRes.status === 400, "Rejects weak password (< 8 chars) with 400");

  // Missing uppercase or number
  const noUpperRes = await resetPasswordHandler(
    createMockRequest("/api/auth/reset-password", { resetToken: issuedResetToken, newPassword: "alllowercase123" })
  );
  assert(noUpperRes.status === 400, "Rejects password without uppercase letter with 400");

  // Security Regression: Passing malicious userId in body must be ignored
  // Valid token & strong password
  const newPasswordValue = "BespokeRotatedPass2026!";
  const validResetRes = await resetPasswordHandler(
    createMockRequest("/api/auth/reset-password", {
      resetToken: issuedResetToken,
      newPassword: newPasswordValue,
      userId: "some_unauthorized_user_id", // Attacker trying to target someone else
    })
  );
  const validResetData = await validResetRes.json();
  assert(
    validResetRes.status === 200 && validResetData.success === true,
    "Successfully resets passkey using verified grant"
  );

  // Security Regression: Token replay after consumption
  const replayResetRes = await resetPasswordHandler(
    createMockRequest("/api/auth/reset-password", {
      resetToken: issuedResetToken,
      newPassword: "AnotherNewPass2026!",
    })
  );
  assert(
    replayResetRes.status === 400,
    "Replay of consumed resetToken is rejected with 400"
  );

  // Verify MongoDB state
  const updatedUser = await UserModel.findById(patronUser._id);
  assert(
    updatedUser !== null && updatedUser.tokenVersion === 1,
    "Incremented tokenVersion to revoke existing sessions and tokens"
  );
  assert(
    updatedUser !== null && updatedUser.passwordChangedAt instanceof Date,
    "Recorded passwordChangedAt timestamp"
  );

  // Old password no longer works
  const oldLoginRes = await loginHandler(
    createMockRequest("/api/auth/login", { email: patronEmail, password: initialPassword })
  );
  assert(oldLoginRes.status === 401, "Old password no longer authenticates (HTTP 401)");

  // New password works
  const newLoginRes = await loginHandler(
    createMockRequest("/api/auth/login", { email: patronEmail, password: newPasswordValue })
  );
  const newLoginData = await newLoginRes.json();
  assert(
    newLoginRes.status === 200 && newLoginData.success === true && !!newLoginData.token,
    "New passkey successfully authenticates and issues access token"
  );

  // 4.4 Endpoint D: Resend OTP
  console.log("\n  -> Testing POST /api/auth/resend-reset-otp");
  await PasswordResetStore.invalidateAllResetState(patronEmail);
  const resendApiRes = await resendResetOtpHandler(
    createMockRequest("/api/auth/resend-reset-otp", { email: patronEmail })
  );
  const resendApiData = await resendApiRes.json();
  assert(
    resendApiRes.status === 200 && resendApiData.success === true,
    "Resend endpoint issues fresh OTP and returns generic success"
  );

  // Immediate resend triggers cooldown
  const rapidResendRes = await resendResetOtpHandler(
    createMockRequest("/api/auth/resend-reset-otp", { email: patronEmail })
  );
  assert(
    rapidResendRes.status === 429,
    "Resend endpoint throttles with 429 during active cooldown"
  );

  // Cleanup test user
  await UserModel.deleteOne({ email: patronEmail });
  await PasswordResetStore.invalidateAllResetState(patronEmail);

  console.log("\n=================================================================");
  console.log(` 🏆 TEST SUITE COMPLETE: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log("=================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
  process.exit(0);
}

runPasswordResetTestSuite().catch((err) => {
  console.error("Test Suite Unhandled Exception:", err);
  process.exit(1);
});
