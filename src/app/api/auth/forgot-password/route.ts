import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/User";
import { generateSecureOtp } from "@/lib/security/otp";
import { extractClientIp } from "@/lib/security/requestInfo";
import { sendPasswordResetEmail } from "@/lib/email/sendPasswordResetEmail";
import { PasswordResetStore, getOpaqueEmailId } from "@/lib/redis/passwordResetStore";

const GENERIC_PUBLIC_RESPONSE = {
  success: true,
  message: "If an account exists for this email address, a password reset code will be sent shortly.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { email } = body;
    const normalizedEmail = (email || "").toString().trim().toLowerCase();

    // 1. Email format validation
    if (!normalizedEmail || normalizedEmail.length > 120) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address format." },
        { status: 400 }
      );
    }

    const clientIp = extractClientIp(request);
    const emailHash = getOpaqueEmailId(normalizedEmail);

    // 2. Distributed Rate Limiting (by IP and by privacy-preserving email identifier)
    try {
      const ipLimit = await PasswordResetStore.checkRateLimit(clientIp, "ip", 10, 900);
      if (!ipLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many password reset requests from this network. Please try again in 15 minutes.",
          },
          { status: 429, headers: { "Retry-After": "900" } }
        );
      }

      const maxEmailAttempts = process.env.NODE_ENV === "production" ? 5 : 20;
      const emailLimit = await PasswordResetStore.checkRateLimit(emailHash, "email", maxEmailAttempts, 900);
      if (!emailLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many reset attempts for this account. Please wait before retrying.",
          },
          { status: 429, headers: { "Retry-After": "900" } }
        );
      }
    } catch (rlErr: any) {
      console.warn("[RateLimit] Notice during rate check:", rlErr.message);
    }

    await connectToDatabase();

    // 3. User Lookup
    const user = await UserModel.findOne({ email: normalizedEmail });

    // Privacy rule: Return identical generic message if user doesn't exist or is blocked
    if (!user || user.isBlocked) {
      console.log(`[AUTH AUDIT] Password reset requested for unregistered or blocked address (IP: ${clientIp})`);
      return NextResponse.json(GENERIC_PUBLIC_RESPONSE, { status: 200 });
    }

    // 4. Generate cryptographically uniform 6-digit OTP
    const rawOtp = generateSecureOtp();

    // 5. Atomic Redis Storage with Cooldown Enforcement
    const saveResult = await PasswordResetStore.saveOtpWithCooldown(
      normalizedEmail,
      user._id.toString(),
      rawOtp
    );

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${saveResult.retryAfter || 60} seconds before requesting another reset code.`,
          retryAfter: saveResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 6. Dispatch Password Reset Email via existing SMTP service
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });

    if (!emailResult.success) {
      console.warn(`[EMAIL WARNING] Failed to deliver password reset OTP to ${user.email}: ${emailResult.error}`);
      // Invalidate the issued OTP if email delivery failed so it cannot be stranded
      await PasswordResetStore.invalidateOtpOnDeliveryFailure(normalizedEmail);
      
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev) {
        return NextResponse.json(
          {
            success: false,
            error: `Email delivery failed: ${emailResult.error}. Please check SMTP configuration.`,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(GENERIC_PUBLIC_RESPONSE, { status: 200 });
    }

    console.log(`[AUTH AUDIT] Password reset OTP dispatched successfully to user ID: ${user._id}`);

    // In local development / test mode only, allow inspecting devOtp for testing convenience
    const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    return NextResponse.json(
      {
        ...GENERIC_PUBLIC_RESPONSE,
        ...(isDev ? { _devOtp: rawOtp } : {}),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH ERROR] Unhandled exception in forgot-password:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process password reset request at this time. Please try again later.",
      },
      { status: 500 }
    );
  }
}
