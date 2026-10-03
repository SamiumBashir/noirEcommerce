import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "noir_atelier_secret_jwt_key_2026_production";

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function signJwtToken(payload: JwtUserPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJwtToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
}
