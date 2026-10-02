import { NextRequest, NextResponse } from "next/server";

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
