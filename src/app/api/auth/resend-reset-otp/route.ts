import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/User";
import { generateSecureOtp } from "@/lib/security/otp";
import { extractClientIp } from "@/lib/security/requestInfo";
import { sendPasswordResetEmail } from "@/lib/email/sendPasswordResetEmail";
import { PasswordResetStore, getOpaqueEmailId } from "@/lib/redis/passwordResetStore";

const GENERIC_PUBLIC_RESEND_RESPONSE = {
  success: true,
  message: "If an account exists for this email address, a new reset code will be sent shortly.",
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

    // 2. Distributed Rate Limiting
    try {
      const resendLimit = await PasswordResetStore.checkRateLimit(`resend:${emailHash}`, "email", 5, 900);
      if (!resendLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many resend attempts for this account. Please wait 15 minutes before retrying.",
          },
          { status: 429 }
        );
      }
    } catch (rlErr: any) {
      console.warn("[RateLimit] Notice during resend check:", rlErr.message);
    }

    await connectToDatabase();

    // 3. User lookup
    const user = await UserModel.findOne({ email: normalizedEmail });

    // Privacy rule: Return identical generic message if user doesn't exist or is blocked
    if (!user || user.isBlocked) {
      console.log(`[AUTH AUDIT] Password reset resend requested for unregistered address (IP: ${clientIp})`);
      return NextResponse.json(GENERIC_PUBLIC_RESEND_RESPONSE, { status: 200 });
    }

    // 4. Generate new cryptographically secure 6-digit OTP
    const rawOtp = generateSecureOtp();

    // 5. Atomically update OTP and enforce 60-second cooldown in Redis
    const saveResult = await PasswordResetStore.saveOtpWithCooldown(
      normalizedEmail,
      user._id.toString(),
      rawOtp
    );

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${saveResult.retryAfter || 60} seconds before requesting a new verification code.`,
          retryAfter: saveResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 6. Dispatch Email
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });

    if (!emailResult.success) {
      console.warn(`[EMAIL WARNING] Resend delivery failed for ${user.email}: ${emailResult.error}`);
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
      return NextResponse.json(GENERIC_PUBLIC_RESEND_RESPONSE, { status: 200 });
    }

    console.log(`[AUTH AUDIT] Fresh password reset OTP dispatched to user ID: ${user._id}`);

    const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    return NextResponse.json(
      {
        ...GENERIC_PUBLIC_RESEND_RESPONSE,
        cooldownSeconds: 60,
        ...(isDev ? { _devOtp: rawOtp } : {}),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH ERROR] Unhandled exception in resend-reset-otp:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to resend code at this time. Please try again.",
      },
      { status: 500 }
    );
  }
}
