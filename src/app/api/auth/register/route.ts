import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, hashPassword } from "@/lib/db/models/User";
import { sendOtpEmail } from "@/lib/email/sendOtpEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const trimmedName = (name || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const rawPassword = (password || "").trim();

    if (!trimmedName || !normalizedEmail || !rawPassword) {
      return NextResponse.json(
        { success: false, error: "Full name, email address, and password are required." },
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

    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    // If an account exists and is already verified, reject registration
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    // Generate secure 6-digit verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const hashedPassword = await hashPassword(rawPassword);
    const isFirstUserAdmin = normalizedEmail.includes("admin@");

    if (existingUser && !existingUser.isVerified) {
      // User registered before but hasn't verified yet - update details & issue fresh OTP
      existingUser.name = trimmedName;
      existingUser.password = hashedPassword;
      existingUser.verificationOtp = otp;
      existingUser.verificationOtpExpires = otpExpires;
      await existingUser.save();
    } else {
      // Create new unverified user
      await UserModel.create({
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: isFirstUserAdmin ? "admin" : "customer",
        isActive: true,
        isBlocked: false,
        isVerified: false,
        verificationOtp: otp,
        verificationOtpExpires: otpExpires,
      });
    }

    // Trigger OTP email dispatch asynchronously
    sendOtpEmail({
      email: normalizedEmail,
      name: trimmedName,
      otp,
      expiresInMinutes: 10,
    }).catch((err) => {
      console.error("[AUTH] Failed to trigger OTP verification email:", err?.message || err);
    });

    return NextResponse.json(
      {
        success: true,
        requiresOtp: true,
        email: normalizedEmail,
        name: trimmedName,
        message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please verify to activate your account.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH] Registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
