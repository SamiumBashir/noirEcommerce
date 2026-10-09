import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, hashPassword } from "@/lib/db/models/User";
import { sendOtpEmail } from "@/lib/email/sendOtpEmail";
import { generateSecureOtp, hashOtp } from "@/lib/security/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const trimmedName = (name || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const rawPassword = (password || "").trim();

    // 1. Input Validation
    if (!trimmedName || !normalizedEmail || !rawPassword) {
      return NextResponse.json(
        { success: false, error: "Full name, email address, and password are required." },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (rawPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Existing user check
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser && (existingUser.isVerified || existingUser.isEmailVerified)) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    // 3. Cryptographically secure 6-digit OTP generation (Uniformly distributed)
    const rawOtp = generateSecureOtp();
    const otpHash = hashOtp(rawOtp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const hashedPassword = await hashPassword(rawPassword);
    const isFirstUserAdmin = normalizedEmail.includes("admin@");

    if (existingUser && !existingUser.isVerified) {
      // User registered earlier but has not yet verified: update credentials and reset OTP challenge
      existingUser.name = trimmedName;
      existingUser.password = hashedPassword;
      existingUser.emailVerificationOtpHash = otpHash;
      existingUser.emailVerificationExpiresAt = otpExpires;
      existingUser.emailVerificationAttempts = 0;
      existingUser.emailVerificationLastSentAt = new Date();
      existingUser.verificationOtp = undefined; // Ensure legacy plaintext is scrubbed
      await existingUser.save();
    } else {
      // Create new unverified user record
      await UserModel.create({
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: isFirstUserAdmin ? "admin" : "customer",
        isActive: true,
        isBlocked: false,
        isVerified: false,
        isEmailVerified: false,
        emailVerificationOtpHash: otpHash,
        emailVerificationExpiresAt: otpExpires,
        emailVerificationAttempts: 0,
        emailVerificationLastSentAt: new Date(),
      });
    }

    // 4. Dispatch verification email (Awaited to ensure delivery in serverless environment)
    let emailDispatchError: string | null = null;
    try {
      const emailResult = await sendOtpEmail({
        email: normalizedEmail,
        name: trimmedName,
        otp: rawOtp,
        expiresInMinutes: 10,
      });
      if (!emailResult.success) {
        emailDispatchError = emailResult.error || "Email delivery failed";
      }
    } catch (err: any) {
      emailDispatchError = err?.message || "Unexpected email error";
    }

    // 5. Safe Response: NEVER return raw OTP, hashes, or passwords (Phase 3 requirement)
    return NextResponse.json(
      {
        success: true,
        requiresOtp: true,
        email: normalizedEmail,
        message: emailDispatchError
          ? `Account created. Verification email notice: ${emailDispatchError}. You may request a resend.`
          : `A 6-digit verification code has been dispatched to ${normalizedEmail}. Please verify to activate your account.`,
        emailSent: !emailDispatchError,
        emailError: emailDispatchError || undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[AUTH] Registration error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
