import { NextRequest, NextResponse } from "next/server";
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

    const { email, otp } = body;
    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    const normalizedOtp = (otp || "").toString().trim();

    // 1. Validate email and ensure OTP is strictly 6 numeric digits
    if (!normalizedEmail || !/^\d{6}$/.test(normalizedOtp)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid email address and exactly 6-digit verification code are required.",
        },
        { status: 400 }
      );
    }

    const clientIp = extractClientIp(request);

    // 2. Rate limit verification attempts by IP
    try {
      const ipLimit = await PasswordResetStore.checkRateLimit(`verify:${clientIp}`, "ip", 15, 900);
      if (!ipLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many verification attempts from this network. Please wait before retrying.",
          },
          { status: 429 }
        );
      }
    } catch (rlErr: any) {
      console.warn("[RateLimit] Notice during verify check:", rlErr.message);
    }

    // 3. Atomic OTP Verification & Consumption via Redis Lua Script
    const verifyResult = await PasswordResetStore.verifyAndConsumeOtp(
      normalizedEmail,
      normalizedOtp
    );

    if (!verifyResult.success) {
      if (verifyResult.locked) {
        console.warn(`[AUTH AUDIT] OTP attempts limit reached for email hash (IP: ${clientIp})`);
        return NextResponse.json(
          {
            success: false,
            error: verifyResult.error || "Maximum verification attempts exceeded. Please request a new code.",
            locked: true,
          },
          { status: 429 }
        );
      }

      if (verifyResult.expired) {
        return NextResponse.json(
          {
            success: false,
            error: verifyResult.error || "Verification code has expired. Please request a new code.",
            expired: true,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || "Invalid verification code.",
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    console.log(`[AUTH AUDIT] Password reset OTP successfully verified and consumed for email hash (IP: ${clientIp})`);

    // 4. Return single-use reset authorization token (valid for 5 minutes)
    return NextResponse.json(
      {
        success: true,
        message: "Email verification successful.",
        resetToken: verifyResult.resetToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH ERROR] Unhandled exception in verify-reset-otp:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify code at this time. Please try again.",
      },
      { status: 500 }
    );
  }
}
