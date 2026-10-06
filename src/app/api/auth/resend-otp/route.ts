import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/User";
import { sendOtpEmail } from "@/lib/email/sendOtpEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
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

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: "Account is already verified. Please sign in." },
        { status: 400 }
      );
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationOtp = otp;
    user.verificationOtpExpires = otpExpires;
    await user.save();

    // Send OTP email
    sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      expiresInMinutes: 10,
    }).catch((err) => {
      console.error("[AUTH] Resend OTP email failed:", err?.message || err);
    });

    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${user.email}.`,
      ...(isDev ? { devOtp: otp } : {}),
    });
  } catch (error: any) {
    console.error("[AUTH] Resend OTP error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resend verification code." },
      { status: 500 }
    );
  }
}
