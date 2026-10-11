import crypto from "crypto";
import { getRedisClient, isRedisConfigured } from "./redisClient";
import { hashOtp } from "@/lib/security/otp";

// Configuration Defaults
export const OTP_TTL_SECONDS = 600; // 10 minutes
export const RESEND_COOLDOWN_SECONDS = 60; // 60 seconds
export const RESET_GRANT_TTL_SECONDS = 300; // 5 minutes
export const MAX_OTP_ATTEMPTS = 5; // Max 5 incorrect attempts before lockout
export const RATE_LIMIT_WINDOW_SECONDS = 900; // 15 minutes
export const RATE_LIMIT_MAX_PER_IP = 10;
export const RATE_LIMIT_MAX_PER_EMAIL = 4;

export interface StoredOtpData {
  userId: string;
  otpHash: string;
  attempts: number;
  version: string;
  createdAt: number;
}

export interface StoredGrantData {
  userId: string;
  emailHash: string;
  createdAt: number;
}

/**
 * Creates a privacy-preserving opaque SHA-256 identifier from normalized email.
 * Never stores raw email addresses as Redis key names.
 */
export function getOpaqueEmailId(email: string): string {
  const normalized = (email || "").trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Computes a SHA-256 cryptographic digest of the raw reset token.
 * Only the digest is stored in Redis; the raw token is returned exclusively to the client.
 */
export function hashResetToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// ============================================================
// IN-MEMORY EMULATOR (For Unit Tests & Safe Local Dev Without Live Redis)
// Semantically identical to the Redis Lua scripts for test verification.
// ============================================================
interface MemoryEntry {
  value: string;
  expiresAt: number;
}
const memoryStore = new Map<string, MemoryEntry>();

function cleanExpiredMemoryKeys() {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

// ============================================================
// ATOMIC REDIS LUA SCRIPTS
// ============================================================

/**
 * Lua Script: Atomically checks cooldown and stores new OTP.
 * KEYS[1] = cooldownKey, KEYS[2] = otpKey
 * ARGV[1] = otpPayload, ARGV[2] = otpTtl, ARGV[3] = cooldownTtl
 * Returns: 1 if saved successfully, -1 if cooldown is currently active.
 */
const SAVE_OTP_LUA = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  local remainingTtl = redis.call('TTL', KEYS[1])
  return -remainingTtl
end
redis.call('SETEX', KEYS[2], tonumber(ARGV[2]), ARGV[1])
redis.call('SETEX', KEYS[1], tonumber(ARGV[3]), '1')
return 1
`;

/**
 * Lua Script: Atomically verifies OTP, handles attempt counting, locks out on limit,
 * and atomically consumes the OTP while issuing the reset grant.
 * KEYS[1] = otpKey, KEYS[2] = grantKey
 * ARGV[1] = candidateOtpHash, ARGV[2] = grantPayload, ARGV[3] = grantTtl, ARGV[4] = maxAttempts
 * Returns:
 *   100: Success! OTP consumed, grant issued.
 *   -1: OTP key not found or expired.
 *   -2: Lockout (attempts exceeded, OTP deleted).
 *   >= 0 and < 100: Failed attempt, returns number of attempts remaining.
 */
const VERIFY_AND_CONSUME_OTP_LUA = `
local otpDataStr = redis.call('GET', KEYS[1])
if not otpDataStr then
  return -1
end

local cjson = cjson
local otpData = cjson.decode(otpDataStr)
local currentAttempts = tonumber(otpData.attempts) or 0
local maxAttempts = tonumber(ARGV[4]) or 5

if currentAttempts >= maxAttempts then
  redis.call('DEL', KEYS[1])
  return -2
end

if otpData.otpHash == ARGV[1] then
  -- MATCH! Atomically delete OTP and create reset grant
  redis.call('DEL', KEYS[1])
  redis.call('SETEX', KEYS[2], tonumber(ARGV[3]), ARGV[2])
  return 100
else
  -- MISMATCH! Increment attempts
  currentAttempts = currentAttempts + 1
  otpData.attempts = currentAttempts
  local ttl = redis.call('TTL', KEYS[1])
  if ttl > 0 then
    if currentAttempts >= maxAttempts then
      redis.call('DEL', KEYS[1])
      return -2
    else
      redis.call('SETEX', KEYS[1], ttl, cjson.encode(otpData))
      return maxAttempts - currentAttempts
    end
  else
    redis.call('DEL', KEYS[1])
    return -1
  end
end
`;

/**
 * Lua Script: Atomically retrieves and consumes single-use reset grant.
 * KEYS[1] = grantKey
 * Returns: grantPayload if found and consumed; nil if missing/expired/already used.
 */
const CONSUME_RESET_GRANT_LUA = `
local grantStr = redis.call('GET', KEYS[1])
if not grantStr then
  return nil
end
redis.call('DEL', KEYS[1])
return grantStr
`;

/**
 * Lua Script: Distributed sliding/rolling rate limiter.
 * KEYS[1] = rateLimitKey
 * ARGV[1] = windowSeconds, ARGV[2] = maxAllowed
 * Returns: {currentCount, isAllowed (1 or 0)}
 */
const RATE_LIMIT_LUA = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
end
local maxAllowed = tonumber(ARGV[2])
if current > maxAllowed then
  return {current, 0}
else
  return {current, 1}
end
`;

// ============================================================
// REPOSITORY METHODS
// ============================================================

export class PasswordResetStore {
  /**
   * Checks whether distributed rate limit is exceeded.
   */
  static async checkRateLimit(
    identifier: string,
    type: "ip" | "email",
    maxAllowed: number = type === "ip" ? RATE_LIMIT_MAX_PER_IP : RATE_LIMIT_MAX_PER_EMAIL,
    windowSeconds: number = RATE_LIMIT_WINDOW_SECONDS
  ): Promise<{ allowed: boolean; currentCount: number }> {
    const key = `pwdreset:rl:${type}:${identifier}`;
    const client = getRedisClient();

    if (client) {
      try {
        const result: any = await client.eval(
          RATE_LIMIT_LUA,
          1,
          key,
          windowSeconds.toString(),
          maxAllowed.toString()
        );
        const count = Number(result[0]);
        const allowed = Number(result[1]) === 1;
        return { allowed, currentCount: count };
      } catch (err: any) {
        if (process.env.NODE_ENV === "production") {
          console.error("[RateLimit Error] Redis rate limit check failed:", err.message);
          throw new Error("Temporary service dependency error");
        }
      }
    }

    // In-memory fallback for local dev / tests
    cleanExpiredMemoryKeys();
    const now = Date.now();
    const entry = memoryStore.get(key);
    let count = 1;
    if (entry && entry.expiresAt > now) {
      count = Number(entry.value) + 1;
      entry.value = count.toString();
    } else {
      memoryStore.set(key, {
        value: "1",
        expiresAt: now + windowSeconds * 1000,
      });
    }

    return { allowed: count <= maxAllowed, currentCount: count };
  }

  /**
   * Saves a new OTP with cooldown enforcement.
   * Returns: { success: true } or { success: false, retryAfter: number }
   */
  static async saveOtpWithCooldown(
    email: string,
    userId: string,
    rawOtp: string
  ): Promise<{ success: boolean; retryAfter?: number }> {
    const emailHash = getOpaqueEmailId(email);
    const otpKey = `pwdreset:otp:${emailHash}`;
    const cooldownKey = `pwdreset:cooldown:${emailHash}`;

    const otpHash = hashOtp(rawOtp);
    const version = crypto.randomUUID();
    const payload: StoredOtpData = {
      userId,
      otpHash,
      attempts: 0,
      version,
      createdAt: Date.now(),
    };
    const payloadStr = JSON.stringify(payload);

    const client = getRedisClient();
    if (client) {
      try {
        const result: any = await client.eval(
          SAVE_OTP_LUA,
          2,
          cooldownKey,
          otpKey,
          payloadStr,
          OTP_TTL_SECONDS.toString(),
          RESEND_COOLDOWN_SECONDS.toString()
        );
        const code = Number(result);
        if (code === 1) {
          return { success: true };
        } else {
          // Negative code is remaining cooldown seconds
          return { success: false, retryAfter: Math.abs(code) };
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === "production") {
          console.error("[Redis Error] Failed to execute saveOtpWithCooldown:", err.message);
          throw new Error("Unable to record OTP state in secure storage");
        }
      }
    }

    // In-memory fallback
    cleanExpiredMemoryKeys();
    const now = Date.now();
    const existingCooldown = memoryStore.get(cooldownKey);
    if (existingCooldown && existingCooldown.expiresAt > now) {
      const remainingSeconds = Math.ceil((existingCooldown.expiresAt - now) / 1000);
      return { success: false, retryAfter: remainingSeconds };
    }

    memoryStore.set(otpKey, {
      value: payloadStr,
      expiresAt: now + OTP_TTL_SECONDS * 1000,
    });
    memoryStore.set(cooldownKey, {
      value: "1",
      expiresAt: now + RESEND_COOLDOWN_SECONDS * 1000,
    });

    return { success: true };
  }

  /**
   * Atomically verifies OTP and consumes it, issuing a single-use reset grant.
   */
  static async verifyAndConsumeOtp(
    email: string,
    candidateOtp: string
  ): Promise<{
    success: boolean;
    resetToken?: string;
    locked?: boolean;
    expired?: boolean;
    remainingAttempts?: number;
    error?: string;
  }> {
    const emailHash = getOpaqueEmailId(email);
    const otpKey = `pwdreset:otp:${emailHash}`;

    // Generate random 32-byte reset token (256 bits of entropy)
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawResetToken);
    const grantKey = `pwdreset:grant:${tokenHash}`;

    const candidateHash = hashOtp(candidateOtp);
    const client = getRedisClient();

    if (client) {
      try {
        // Read userId first if needed for grant payload
        const existingDataStr = await client.get(otpKey);
        if (!existingDataStr) {
          return { success: false, expired: true, error: "Verification code has expired or does not exist." };
        }
        const existingData: StoredOtpData = JSON.parse(existingDataStr);
        const grantPayload: StoredGrantData = {
          userId: existingData.userId,
          emailHash,
          createdAt: Date.now(),
        };

        const result: any = await client.eval(
          VERIFY_AND_CONSUME_OTP_LUA,
          2,
          otpKey,
          grantKey,
          candidateHash,
          JSON.stringify(grantPayload),
          RESET_GRANT_TTL_SECONDS.toString(),
          MAX_OTP_ATTEMPTS.toString()
        );

        const code = Number(result);
        if (code === 100) {
          return { success: true, resetToken: rawResetToken };
        } else if (code === -1) {
          return { success: false, expired: true, error: "Verification code has expired or is invalid." };
        } else if (code === -2) {
          return {
            success: false,
            locked: true,
            error: "Maximum verification attempts exceeded. Please request a new verification code.",
          };
        } else {
          return {
            success: false,
            remainingAttempts: code,
            error: `Invalid verification code. ${code} attempt${code === 1 ? "" : "s"} remaining.`,
          };
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === "production") {
          console.error("[Redis Error] verifyAndConsumeOtp failed:", err.message);
          throw new Error("Secure OTP verification service unavailable");
        }
      }
    }

    // In-memory fallback
    cleanExpiredMemoryKeys();
    const entry = memoryStore.get(otpKey);
    if (!entry || entry.expiresAt <= Date.now()) {
      return { success: false, expired: true, error: "Verification code has expired or does not exist." };
    }

    const otpData: StoredOtpData = JSON.parse(entry.value);
    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
      memoryStore.delete(otpKey);
      return {
        success: false,
        locked: true,
        error: "Maximum verification attempts exceeded. Please request a new verification code.",
      };
    }

    // Verify HMAC hashes
    const isMatch = candidateHash === otpData.otpHash;
    if (isMatch) {
      memoryStore.delete(otpKey);
      const grantPayload: StoredGrantData = {
        userId: otpData.userId,
        emailHash,
        createdAt: Date.now(),
      };
      memoryStore.set(grantKey, {
        value: JSON.stringify(grantPayload),
        expiresAt: Date.now() + RESET_GRANT_TTL_SECONDS * 1000,
      });
      return { success: true, resetToken: rawResetToken };
    } else {
      otpData.attempts += 1;
      if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
        memoryStore.delete(otpKey);
        return {
          success: false,
          locked: true,
          error: "Maximum verification attempts exceeded. Please request a new verification code.",
        };
      }
      entry.value = JSON.stringify(otpData);
      const remaining = MAX_OTP_ATTEMPTS - otpData.attempts;
      return {
        success: false,
        remainingAttempts: remaining,
        error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      };
    }
  }

  /**
   * Atomically consumes a reset grant. Once consumed, the grant is invalidated forever.
   * Returns StoredGrantData if valid, or null if missing/expired/reused.
   */
  static async consumeResetGrant(rawResetToken: string): Promise<StoredGrantData | null> {
    if (!rawResetToken || rawResetToken.length !== 64) {
      return null;
    }

    const tokenHash = hashResetToken(rawResetToken);
    const grantKey = `pwdreset:grant:${tokenHash}`;
    const client = getRedisClient();

    if (client) {
      try {
        const result: any = await client.eval(CONSUME_RESET_GRANT_LUA, 1, grantKey);
        if (!result) return null;
        return JSON.parse(result) as StoredGrantData;
      } catch (err: any) {
        if (process.env.NODE_ENV === "production") {
          console.error("[Redis Error] consumeResetGrant failed:", err.message);
          throw new Error("Authorization grant verification unavailable");
        }
      }
    }

    // In-memory fallback
    cleanExpiredMemoryKeys();
    const entry = memoryStore.get(grantKey);
    if (!entry || entry.expiresAt <= Date.now()) {
      return null;
    }
    memoryStore.delete(grantKey); // Atomically consume
    return JSON.parse(entry.value) as StoredGrantData;
  }

  /**
   * Cleans up all remaining reset state for an email address after a successful password update.
   */
  static async invalidateAllResetState(email: string): Promise<void> {
    const emailHash = getOpaqueEmailId(email);
    const otpKey = `pwdreset:otp:${emailHash}`;
    const cooldownKey = `pwdreset:cooldown:${emailHash}`;

    const client = getRedisClient();
    if (client) {
      try {
        await client.del(otpKey, cooldownKey);
      } catch {
        // Non-blocking cleanup
      }
    }
    memoryStore.delete(otpKey);
    memoryStore.delete(cooldownKey);
  }

  /**
   * Invalidate OTP when email delivery fails.
   */
  static async invalidateOtpOnDeliveryFailure(email: string): Promise<void> {
    const emailHash = getOpaqueEmailId(email);
    const otpKey = `pwdreset:otp:${emailHash}`;
    const client = getRedisClient();
    if (client) {
      try {
        await client.del(otpKey);
      } catch {
        // Non-blocking cleanup
      }
    }
    memoryStore.delete(otpKey);
  }

  /**
   * Helper for test suites to reset memory store.
   */
  static _resetMemoryStoreForTesting(): void {
    memoryStore.clear();
  }
}
