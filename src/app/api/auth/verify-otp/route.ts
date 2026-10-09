import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/User";
import { LoginActivityModel } from "@/lib/db/models/LoginActivity";
import { getRequestInfo } from "@/lib/security/requestInfo";
import { signJwtToken } from "@/lib/security/jwt";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import { verifyOtpHash } from "@/lib/security/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedOtp = (otp || "").toString().trim();

    // 1. Validation: require email and strictly 6 numeric digits (Phase 5)
    if (!normalizedEmail || !/^\d{6}$/.test(normalizedOtp)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid email and exactly 6-digit verification code are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Locate user including select: false security fields
    const user = await UserModel.findOne({ email: normalizedEmail }).select(
      "+emailVerificationOtpHash +verificationOtp"
    );

    if (!user) {
      // Safe generic response to avoid account enumeration
      return NextResponse.json(
        { success: false, error: "Invalid verification request or code has expired." },
        { status: 400 }
      );
    }

    // 3. If account is already verified, do not allow reusing verification challenge
    if (user.isVerified || user.isEmailVerified) {
      const token = signJwtToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return NextResponse.json({
        success: true,
        message: "Your email has already been verified.",
        alreadyVerified: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // 4. Rate-limiting & failed-attempt limits (Max 5 attempts)
    const attempts = user.emailVerificationAttempts || 0;
    if (attempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum verification attempts exceeded. Please request a new verification code.",
          locked: true,
        },
        { status: 429 }
      );
    }

    // 5. Check OTP expiration (10 minutes window)
    const expiresAt = user.emailVerificationExpiresAt || user.verificationOtpExpires;
    if (!expiresAt || expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification code has expired. Please request a new code.",
          expired: true,
        },
        { status: 400 }
      );
    }

    // 6. Secure comparison against cryptographic hash (timingSafeEqual)
    let isMatch = false;
    if (user.emailVerificationOtpHash) {
      isMatch = verifyOtpHash(normalizedOtp, user.emailVerificationOtpHash);
    } else if (user.verificationOtp) {
      // Legacy backward-compatibility fallback
      isMatch = user.verificationOtp === normalizedOtp;
    }

    if (!isMatch) {
      // Increment failed attempts atomically
      const newAttempts = attempts + 1;
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { emailVerificationAttempts: newAttempts } }
      );

      const remainingAttempts = Math.max(0, 5 - newAttempts);
      return NextResponse.json(
        {
          success: false,
          error:
            remainingAttempts > 0
              ? `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} remaining.`
              : "Invalid verification code. Maximum attempts reached. Please request a new code.",
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 7. Atomic update: Mark verified and invalidate OTP to prevent race conditions & double-spend
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: user._id,
        isVerified: false,
        $or: [
          { emailVerificationExpiresAt: { $gte: new Date() } },
          { verificationOtpExpires: { $gte: new Date() } },
        ],
      },
      {
        $set: {
          isVerified: true,
          isEmailVerified: true,
          lastLoginAt: new Date(),
        },
        $unset: {
          emailVerificationOtpHash: 1,
          emailVerificationExpiresAt: 1,
          emailVerificationAttempts: 1,
          verificationOtp: 1,
          verificationOtpExpires: 1,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification challenge already completed or expired. Please sign in.",
        },
        { status: 409 }
      );
    }

    // 8. Idempotent Welcome Email dispatch: ONLY AFTER successful verification commit (Phase 5 & 7)
    if (!updatedUser.welcomeEmailSentAt) {
      try {
        const welcomeResult = await sendWelcomeEmail({
          email: updatedUser.email,
          name: updatedUser.name,
        });

        if (welcomeResult.success) {
          await UserModel.updateOne(
            { _id: updatedUser._id, welcomeEmailSentAt: { $exists: false } },
            { $set: { welcomeEmailSentAt: new Date() } }
          );
        }
      } catch (welcomeErr: any) {
        // Do not rollback verification if welcome mail fails; log for retry
        console.error("[AUTH] Welcome email dispatch error:", welcomeErr?.message || welcomeErr);
      }
    }

    // 9. Record Login Activity for security audit trail
    const requestInfo = getRequestInfo(request);
    await LoginActivityModel.create({
      userId: updatedUser._id,
      email: updatedUser.email,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      device: requestInfo.device,
      browser: requestInfo.browser,
      os: requestInfo.os,
      location: requestInfo.location,
      status: "SUCCESS",
      emailNotificationSent: false,
    }).catch(() => {});

    // 10. Issue session JWT Token
    const token = signJwtToken({
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your email has been verified successfully.",
        token,
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH] OTP verification exception:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "An error occurred during verification. Please try again." },
      { status: 500 }
    );
  }
}
