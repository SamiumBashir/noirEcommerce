import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[SECURITY WARNING] JWT_SECRET environment variable is missing in production! Please set a strong random secret."
    );
  }
  return "noir_atelier_secret_jwt_key_2026_production";
}

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function signJwtToken(payload: JwtUserPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyJwtToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtUserPayload;
  } catch {
    return null;
  }
}
