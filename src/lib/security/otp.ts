import crypto from "crypto";

const OTP_SECRET = process.env.JWT_SECRET || "noir_default_secure_secret_2026";

/**
 * Generates a cryptographically secure, uniformly distributed 6-digit numeric OTP.
 * Uses crypto.randomInt to avoid Math.random() predictability.
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes a keyed HMAC-SHA256 hash of the OTP using the server secret.
 * This prevents offline rainbow-table brute force attacks on the 6-digit space if the database is exposed.
 */
export function hashOtp(otp: string): string {
  const normalizedOtp = (otp || "").toString().trim();
  return crypto.createHmac("sha256", OTP_SECRET).update(normalizedOtp).digest("hex");
}

/**
 * Securely compares candidate OTP against stored hash using timing-safe comparison.
 * Prevents timing side-channel attacks.
 */
export function verifyOtpHash(candidateOtp: string, storedHash: string): boolean {
  if (!candidateOtp || !storedHash) return false;
  const candidateHash = hashOtp(candidateOtp);
  if (candidateHash.length !== storedHash.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(candidateHash, "utf-8"),
      Buffer.from(storedHash, "utf-8")
    );
  } catch {
    return false;
  }
}
