import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, JwtUserPayload } from "@/lib/security/jwt";

/**
 * Extracts and verifies JWT from Authorization header or cookies.
 */
export function getAuthenticatedUser(request: NextRequest): JwtUserPayload | null {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const decoded = verifyJwtToken(token);
      if (decoded) return decoded;
    }
  }

  // 2. Check cookies
  const tokenFromCookie =
    request.cookies.get("noir_token")?.value ||
    request.cookies.get("noir_admin_token")?.value;

  if (tokenFromCookie) {
    const decoded = verifyJwtToken(tokenFromCookie);
    if (decoded) return decoded;
  }

  return null;
}

/**
 * Requires an authenticated user session (customer or admin).
 */
export function requireAuth(request: NextRequest): {
  user: JwtUserPayload | null;
  errorResponse?: NextResponse;
} {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required. Please sign in to continue." },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Requires an authenticated Administrator role.
 */
export function requireAdmin(request: NextRequest): {
  user: JwtUserPayload | null;
  errorResponse?: NextResponse;
} {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required. Administrator credentials required." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Access Denied: Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  return { user };
}
