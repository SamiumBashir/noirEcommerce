import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import {
  EMAIL_QUEUE_NAME,
  LOGIN_NOTIFICATION_JOB,
  LoginNotificationJobData,
  isRedisConfigured,
} from "./emailQueue";
import { executeDirectResendDelivery } from "../email/sendLoginNotification";

let emailWorker: Worker<LoginNotificationJobData> | null = null;

export function startEmailWorker(): Worker<LoginNotificationJobData> | null {
  if (!isRedisConfigured()) {
    console.warn("[Worker] REDIS_URL not configured. BullMQ worker cannot start.");
    return null;
  }

  if (emailWorker) {
    return emailWorker;
  }

  const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  emailWorker = new Worker<LoginNotificationJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<LoginNotificationJobData>) => {
      console.log(`[Worker] Processing email job ${job.id} for ${job.data.email}`);

      if (job.name === LOGIN_NOTIFICATION_JOB) {
        const result = await executeDirectResendDelivery(job.data);
        if (!result.success && result.error !== "RESEND_API_KEY_NOT_CONFIGURED") {
          throw new Error(result.error || "Email delivery failed in worker");
        }
        return result;
      }

      console.warn(`[Worker] Unknown job name: ${job.name}`);
      return { skipped: true };
    },
    {
      connection,
      concurrency: 5,
    }
  );

  emailWorker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
  });

  emailWorker.on("error", (err) => {
    console.error("[Worker] Worker connection error:", err.message);
  });

  console.log("[Worker] BullMQ email worker started and listening on queue:", EMAIL_QUEUE_NAME);
  return emailWorker;
}

export async function stopEmailWorker(): Promise<void> {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
    console.log("[Worker] BullMQ email worker stopped gracefully");
  }
}
