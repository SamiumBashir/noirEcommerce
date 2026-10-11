import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, hashPassword } from "@/lib/db/models/User";
import { PasswordResetStore } from "@/lib/redis/passwordResetStore";
import { extractClientIp } from "@/lib/security/requestInfo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { resetToken, newPassword } = body;
    const rawResetToken = (resetToken || "").toString().trim();
    const rawNewPassword = (newPassword || "").toString();

    // 1. Validate resetToken format (64-character hexadecimal digest)
    if (!rawResetToken || !/^[a-f0-9]{64}$/i.test(rawResetToken)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or malformed reset token. Please restart the password reset process.",
        },
        { status: 400 }
      );
    }

    // 2. Validate password requirements
    if (!rawNewPassword || rawNewPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Passkey must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (rawNewPassword.length > 128) {
      return NextResponse.json(
        {
          success: false,
          error: "Passkey cannot exceed 128 characters.",
        },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(rawNewPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: "Passkey must contain at least one uppercase letter (A-Z).",
        },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(rawNewPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: "Passkey must contain at least one numeric digit (0-9).",
        },
        { status: 400 }
      );
    }

    const clientIp = extractClientIp(request);

    // 3. Atomically consume the single-use reset authorization grant from Redis
    const grant = await PasswordResetStore.consumeResetGrant(rawResetToken);
    if (!grant || !grant.userId) {
      console.warn(`[AUTH AUDIT] Attempt to use invalid, expired, or replayed reset token from IP: ${clientIp}`);
      return NextResponse.json(
        {
          success: false,
          error: "This reset session has expired or has already been used. Please request a new verification code.",
          sessionExpired: true,
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 4. Retrieve user exclusively from server-side grant's verified userId
    const user = await UserModel.findById(grant.userId);

    if (!user || user.isBlocked) {
      console.warn(`[AUTH AUDIT] Password reset attempted on ineligible or non-existent user ID: ${grant.userId}`);
      return NextResponse.json(
        {
          success: false,
          error: "Account is not eligible for password reset. Please contact support.",
        },
        { status: 400 }
      );
    }

    // 5. Hash new password using bcryptjs and update account metadata
    const hashedPassword = await hashPassword(rawNewPassword);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    user.isActive = true;
    (user as any).deactivatedAt = undefined;
    (user as any).deactivationReason = undefined;
    // Increment tokenVersion to invalidate any previously issued stateless JWT tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    // Save updated user record
    await user.save();

    // 6. Invalidate all remaining reset flow keys associated with this account
    await PasswordResetStore.invalidateAllResetState(user.email);

    console.log(`[AUTH AUDIT] Password successfully reset for user ID: ${user._id} (email: ${user.email}, IP: ${clientIp})`);

    // 7. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Password reset successful. Please sign in with your new passkey.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH ERROR] Unhandled exception in reset-password:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete password reset at this time. Please try again.",
      },
      { status: 500 }
    );
  }
}
