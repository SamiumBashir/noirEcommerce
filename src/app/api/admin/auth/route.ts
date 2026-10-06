import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LoginActivityModel } from "@/lib/db/models/LoginActivity";
import { getRequestInfo } from "@/lib/security/requestInfo";
import { sendLoginNotification } from "@/lib/email/sendLoginNotification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPassword = (password || "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required for atelier authentication.",
        },
        { status: 400 }
      );
    }

    const isValidAdminEmail =
      normalizedEmail === "admin@noir.studio" ||
      normalizedEmail === "curator.admin@noir.studio" ||
      normalizedEmail === "atelier@noir.studio" ||
      (normalizedEmail.includes("admin") && normalizedEmail.includes("@"));

    const isValidPassword =
      normalizedPassword === "admin123" ||
      normalizedPassword === "noir2026" ||
      normalizedPassword === "admin";

    if (!isValidAdminEmail || !isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: Invalid administrative credentials. Only authorized atelier curators are permitted.",
        },
        { status: 401 }
      );
    }

    // Connect to database and log login activity
    await connectToDatabase();
    const requestInfo = getRequestInfo(request);

    const loginActivity = await LoginActivityModel.create({
      email: normalizedEmail,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      device: requestInfo.device,
      browser: requestInfo.browser,
      os: requestInfo.os,
      location: requestInfo.location,
      status: "SUCCESS",
      emailNotificationSent: false,
    }).catch(() => null);

    // Trigger security notification email (AWAITED to guarantee delivery on Vercel)
    await sendLoginNotification({
      email: normalizedEmail,
      name: "Curator Admin",
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      device: requestInfo.device,
      browser: requestInfo.browser,
      os: requestInfo.os,
      location: requestInfo.location,
      loginTime: requestInfo.loginTime,
      loginActivityId: loginActivity?._id?.toString(),
    }).catch((err) => {
      console.error("[AUTH-ADMIN] Background login notification trigger error:", err?.message || err);
    });

    return NextResponse.json({
      success: true,
      message: "Atelier curator authentication successful.",
      user: {
        id: "usr_curator_admin",
        name: "Curator Admin",
        email: normalizedEmail,
        role: "admin",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
