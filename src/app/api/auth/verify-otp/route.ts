import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/User";
import { LoginActivityModel } from "@/lib/db/models/LoginActivity";
import { getRequestInfo } from "@/lib/security/requestInfo";
import { signJwtToken } from "@/lib/security/jwt";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedOtp = (otp || "").toString().trim();

    if (!normalizedEmail || !normalizedOtp) {
      return NextResponse.json(
        { success: false, error: "Email address and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found for this email address." },
        { status: 404 }
      );
    }

    // If already verified, allow login
    if (user.isVerified) {
      const token = signJwtToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return NextResponse.json({
        success: true,
        message: "Account is already verified.",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Check expiration
    if (!user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification code has expired. Please request a new code.",
          expired: true,
        },
        { status: 400 }
      );
    }

    // Verify code
    if (user.verificationOtp !== normalizedOtp) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid verification code. Please check your inbox and enter the 6-digit code.",
        },
        { status: 400 }
      );
    }

    // Verification SUCCESSFUL: activate account
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    // Extract request info & record initial login activity
    const requestInfo = getRequestInfo(request);
    await LoginActivityModel.create({
      userId: user._id,
      email: user.email,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      device: requestInfo.device,
      browser: requestInfo.browser,
      os: requestInfo.os,
      location: requestInfo.location,
      status: "SUCCESS",
      emailNotificationSent: false,
    }).catch(() => {});

    // Issue JWT token
    const token = signJwtToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // TRIGGER WELCOME WISH EMAIL FROM NOIR ATELIER ASYNCHRONOUSLY
    sendWelcomeEmail({
      email: user.email,
      name: user.name,
    }).catch((err) => {
      console.error("[AUTH] Failed to trigger Welcome Wish email:", err?.message || err);
    });

    return NextResponse.json({
      success: true,
      message: "Account verified successfully! Welcome to NOIR Atelier.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("[AUTH] OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "OTP verification failed." },
      { status: 500 }
    );
  }
}
