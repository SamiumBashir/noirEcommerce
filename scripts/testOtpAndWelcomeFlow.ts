import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextRequest } from "next/server";
import { connectToDatabase } from "../src/lib/db/mongoose";
import { UserModel } from "../src/lib/db/models/User";
import { renderOtpEmail } from "../src/lib/email/templates/otpEmail";
import { renderWelcomeEmail } from "../src/lib/email/templates/welcomeEmail";

import { POST as registerHandler } from "../src/app/api/auth/register/route";
import { POST as verifyOtpHandler } from "../src/app/api/auth/verify-otp/route";
import { POST as resendOtpHandler } from "../src/app/api/auth/resend-otp/route";
import { POST as loginHandler } from "../src/app/api/auth/login/route";

async function runOtpAndWelcomeTests() {
  console.log("=======================================================");
  console.log(" 🧪 NOIR ATELIER — OTP & WELCOME EMAIL FLOW TEST SUITE");
  console.log("=======================================================\n");

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

  // 1. Template Rendering: OTP Email
  console.log("--- 1. OTP Email Template Verification ---");
  const otpTemplate = renderOtpEmail({
    userName: "Elena Rostova",
    otp: "849201",
    expiresInMinutes: 10,
  });
  assert(
    otpTemplate.html.includes("849201") &&
      otpTemplate.html.includes("Elena Rostova") &&
      otpTemplate.html.includes("NOIR ATELIER") &&
      otpTemplate.html.includes("10 minutes"),
    "Renders OTP email with correct 6-digit code and luxury styling"
  );

  // 2. Template Rendering: Welcome Email from NOIR
  console.log("\n--- 2. Welcome Wish Email Template Verification ---");
  const welcomeTemplate = renderWelcomeEmail({
    userName: "Elena Rostova",
    email: "elena@atelier.studio",
  });
  assert(
    welcomeTemplate.html.includes("Welcome to NOIR, Elena Rostova") &&
      welcomeTemplate.html.includes("Your Atelier Privileges") &&
      welcomeTemplate.html.includes("The NOIR Atelier Curators") &&
      welcomeTemplate.html.includes("NOIR ATELIER"),
    "Renders luxury Welcome Wish email with member privileges and branding"
  );

  // 3. Register Handler (Step 1: Generates OTP and unverified user)
  console.log("\n--- 3. Registration with OTP Generation ---");
  const testEmail = `elena_test_${Date.now()}@noir.studio`;
  const testPassword = "NoirPassword2026!";

  // Cleanup in case email exists
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
    regRes.status === 200 && regData.success && regData.requiresOtp === true,
    "Registration returns requiresOtp: true and dispatches verification code"
  );

  // Verify in MongoDB that user is created with isVerified: false and has a 6-digit OTP
  const createdUser = await UserModel.findOne({ email: testEmail });
  assert(
    Boolean(createdUser) &&
      createdUser?.isVerified === false &&
      Boolean(createdUser?.verificationOtp) &&
      createdUser?.verificationOtp?.length === 6,
    "MongoDB record has isVerified: false and a 6-digit verificationOtp"
  );

  const realOtp = createdUser?.verificationOtp || "";

  // 4. Test Resend OTP Endpoint
  console.log("\n--- 4. Resend OTP Code ---");
  const resendReq = new NextRequest("http://localhost/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const resendRes = await resendOtpHandler(resendReq);
  const resendData = await resendRes.json();
  assert(
    resendRes.status === 200 && resendData.success === true,
    "Resend OTP generates and dispatches a fresh code"
  );

  // Fetch updated OTP
  const updatedUser = await UserModel.findOne({ email: testEmail });
  const freshOtp = updatedUser?.verificationOtp || "";
  assert(
    Boolean(freshOtp) && freshOtp.length === 6,
    "Fresh OTP stored successfully in MongoDB"
  );

  // 5. Test Invalid OTP Rejection
  console.log("\n--- 5. Invalid OTP Rejection ---");
  const invalidOtpReq = new NextRequest("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: "000000",
    }),
  });
  const invalidOtpRes = await verifyOtpHandler(invalidOtpReq);
  const invalidData = await invalidOtpRes.json();
  assert(
    invalidOtpRes.status === 400 && invalidData.success === false,
    "Rejects incorrect OTP with 400 Bad Request"
  );

  // 6. Test Valid OTP Verification (Step 2: Activates account & triggers Welcome email)
  console.log("\n--- 6. Valid OTP Verification & Welcome Email Trigger ---");
  const validOtpReq = new NextRequest("http://localhost/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: freshOtp,
    }),
  });
  const validOtpRes = await verifyOtpHandler(validOtpReq);
  const validData = await validOtpRes.json();

  assert(
    validOtpRes.status === 200 &&
      validData.success === true &&
      Boolean(validData.token) &&
      validData.user?.email === testEmail,
    "Successfully validates OTP, generates JWT token, and activates user"
  );

  // Verify user is now marked as isVerified: true in MongoDB
  const verifiedUser = await UserModel.findOne({ email: testEmail });
  assert(
    verifiedUser?.isVerified === true && verifiedUser?.verificationOtp === undefined,
    "User marked isVerified: true and OTP cleared from MongoDB"
  );

  // 7. Test Logging in with the newly verified account
  console.log("\n--- 7. Login with Verified Account ---");
  const loginReq = new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginRes = await loginHandler(loginReq);
  const loginData = await loginRes.json();
  assert(
    loginRes.status === 200 && loginData.success === true && Boolean(loginData.token),
    "Verified account successfully logs in via /api/auth/login"
  );

  // Cleanup test user
  await UserModel.deleteOne({ email: testEmail });

  console.log("\n=======================================================");
  console.log(` Summary: ${passed} of ${total} tests passed.`);
  console.log("=======================================================");

  process.exit(passed === total ? 0 : 1);
}

runOtpAndWelcomeTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
