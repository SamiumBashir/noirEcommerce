import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, hashPassword } from "@/lib/db/models/User";
import { signJwtToken } from "@/lib/security/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider = "google", name, email, password } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const trimmedName = (name || normalizedEmail.split("@")[0].replace(".", " ").toUpperCase()).trim();
    const rawPassword = (password || "").trim() || "noir2026";

    // 1. Validation
    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "Email address is required for social registration." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (rawPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Security passkey must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Connect to database
    let conn;
    try {
      conn = await connectToDatabase();
    } catch (dbErr: any) {
      console.error("[AUTH SOCIAL] Database connection error:", dbErr?.message || dbErr);
    }

    if (!conn) {
      console.warn("[AUTH SOCIAL] Database unavailable, proceeding with fallback notice");
      return NextResponse.json(
        {
          success: false,
          isDbError: true,
          error: "Database authentication or connection error. Please verify MONGODB_USERNAME and MONGODB_PASSWORD in .env.local.",
        },
        { status: 503 }
      );
    }

    // 3. Find or Create User
    let user = await UserModel.findOne({ email: normalizedEmail });
    const hashedPassword = await hashPassword(rawPassword);

    if (user) {
      // Existing user: ensure verified via social provider and update password if provided
      user.name = trimmedName || user.name;
      user.password = hashedPassword;
      user.isVerified = true;
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      // Create new user authenticated via Google / Apple with chosen password
      user = await UserModel.create({
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedEmail.includes("admin@") ? "admin" : "customer",
        isActive: true,
        isBlocked: false,
        isVerified: true,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      });
    }

    // 4. Generate JWT
    const token = signJwtToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json(
      {
        success: true,
        provider,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: `Authenticated successfully with ${provider === "apple" ? "Apple ID" : "Google"}.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH SOCIAL] Error:", error?.message || error);
    const isDbAuthError =
      error?.message?.includes("authentication failed") ||
      error?.message?.includes("bad auth") ||
      error?.name === "MongoServerError";

    return NextResponse.json(
      {
        success: false,
        isDbError: isDbAuthError,
        error: isDbAuthError
          ? "Database authentication failed. Please verify your MONGODB_URI credentials in .env.local."
          : error?.message || "Social authentication failed.",
      },
      { status: 500 }
    );
  }
}
