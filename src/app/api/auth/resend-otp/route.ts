import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/User";
import { sendOtpEmail } from "@/lib/email/sendOtpEmail";
import { generateSecureOtp, hashOtp } from "@/lib/security/otp";

const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No unverified account found for this email address.",
        },
        { status: 404 }
      );
    }

    // Do not issue OTP to an already verified account
    if (user.isVerified || user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "This account has already been verified. Please sign in.",
        },
        { status: 400 }
      );
    }

    // Enforce 60-second cooldown rate limit (Phase 6 requirement)
    const lastSentTime = user.emailVerificationLastSentAt
      ? new Date(user.emailVerificationLastSentAt).getTime()
      : 0;
    const elapsedSeconds = Math.floor((Date.now() - lastSentTime) / 1000);

    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const remaining = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${remaining} seconds before requesting a new verification code.`,
          retryAfter: remaining,
        },
        { status: 429 }
      );
    }

    // Generate fresh cryptographically secure 6-digit OTP
    const rawOtp = generateSecureOtp();
    const otpHash = hashOtp(rawOtp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Atomically invalidate old OTP and store new hashed OTP
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: user._id,
        isVerified: false,
      },
      {
        $set: {
          emailVerificationOtpHash: otpHash,
          emailVerificationExpiresAt: otpExpires,
          emailVerificationAttempts: 0, // Reset failed attempt count for fresh challenge
          emailVerificationLastSentAt: new Date(),
        },
        $unset: {
          verificationOtp: 1,
          verificationOtpExpires: 1,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Account could not be updated. Please try again." },
        { status: 409 }
      );
    }

    // Dispatch verification email
    let emailDispatchError: string | null = null;
    try {
      const emailResult = await sendOtpEmail({
        email: updatedUser.email,
        name: updatedUser.name,
        otp: rawOtp,
        expiresInMinutes: 10,
      });
      if (!emailResult.success) {
        emailDispatchError = emailResult.error || "Email delivery failed";
      }
    } catch (err: any) {
      emailDispatchError = err?.message || "Unexpected email error";
    }

    return NextResponse.json(
      {
        success: true,
        message: emailDispatchError
          ? `Fresh verification code generated. Email notice: ${emailDispatchError}`
          : `A fresh 6-digit verification code has been dispatched to ${updatedUser.email}.`,
        retryAfter: RESEND_COOLDOWN_SECONDS,
        emailSent: !emailDispatchError,
        emailError: emailDispatchError || undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH] Resend OTP error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to resend verification code. Please try again." },
      { status: 500 }
    );
  }
}
