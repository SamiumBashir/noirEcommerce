import Redis from "ioredis";

let redisClient: Redis | null = null;
let connectionAttempted = false;

export function isRedisConfigured(): boolean {
  return Boolean(
    (process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0) ||
    process.env.REDIS_HOST
  );
}

export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl && !process.env.REDIS_HOST) {
    return null;
  }

  try {
    const options: any = {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy(times: number) {
        if (times > 3) {
          // Cease retrying if Redis is unavailable to avoid blocking serverless functions
          return null;
        }
        return Math.min(times * 500, 2000);
      },
    };

    if (redisUrl) {
      // Upstash requires TLS/SSL (rediss://)
      const normalizedUrl =
        redisUrl.startsWith("redis://") && redisUrl.includes("upstash.io")
          ? redisUrl.replace("redis://", "rediss://")
          : redisUrl;
      redisClient = new Redis(normalizedUrl, options);
    } else {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        ...options,
      });
    }

    redisClient.on("error", (err) => {
      // Safe operational logging without leaking connection credentials
      if (!connectionAttempted) {
        console.warn("[Redis] Notice: Redis client encountered connection issue:", err.message);
        connectionAttempted = true;
      }
    });

    redisClient.on("connect", () => {
      console.log("[Redis] Successfully established connection to Redis cluster.");
      connectionAttempted = false;
    });

    return redisClient;
  } catch (err: any) {
    console.warn("[Redis] Failed to initialize Redis client:", err.message);
    return null;
  }
}

/**
 * Checks whether Redis is alive and responding to commands.
 */
export async function pingRedis(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    const res = await client.ping();
    return res === "PONG";
  } catch {
    return false;
  }
}
