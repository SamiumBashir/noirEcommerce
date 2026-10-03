import { Queue, QueueOptions } from "bullmq";
import Redis from "ioredis";

export interface LoginNotificationJobData {
  email: string;
  name: string;
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  loginTime: string;
  loginActivityId?: string;
}

export const EMAIL_QUEUE_NAME = "noir-email-queue";
export const LOGIN_NOTIFICATION_JOB = "LOGIN_NOTIFICATION";

let emailQueue: Queue<LoginNotificationJobData> | null = null;
let redisConnection: Redis | null = null;

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0);
}

function getRedisConnection(): Redis | null {
  if (!isRedisConfigured()) return null;
  if (!redisConnection) {
    try {
      redisConnection = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
          if (times > 3) return null; // Stop reconnecting if down
          return Math.min(times * 500, 2000);
        },
      });
      redisConnection.on("error", (err) => {
        console.warn("[Redis] Connection error in email queue:", err.message);
      });
    } catch (e: any) {
      console.warn("[Redis] Failed to initialize Redis connection:", e.message);
      return null;
    }
  }
  return redisConnection;
}

export function getEmailQueue(): Queue<LoginNotificationJobData> | null {
  if (!isRedisConfigured()) return null;

  if (!emailQueue) {
    const connection = getRedisConnection();
    if (!connection) return null;

    const queueOptions: QueueOptions = {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    };

    emailQueue = new Queue(EMAIL_QUEUE_NAME, queueOptions);
  }

  return emailQueue;
}

/**
 * Enqueues a login notification job with idempotency key (jobId)
 */
export async function enqueueLoginEmailJob(
  data: LoginNotificationJobData
): Promise<{ enqueued: boolean; jobId?: string }> {
  try {
    const queue = getEmailQueue();
    if (!queue) {
      return { enqueued: false };
    }

    // Use loginActivityId as jobId to prevent duplicate queue submissions (Section 10)
    const jobId = data.loginActivityId
      ? `login_email_${data.loginActivityId}`
      : `login_email_${data.email}_${Date.now()}`;

    const job = await queue.add(LOGIN_NOTIFICATION_JOB, data, {
      jobId,
    });

    console.log(`[Queue] Login notification job queued (Job ID: ${job.id})`);
    return { enqueued: true, jobId: job.id };
  } catch (err: any) {
    console.warn("[Queue] Could not enqueue email job, falling back to direct send:", err.message);
    return { enqueued: false };
  }
}
