import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { startEmailWorker, stopEmailWorker } from "../src/lib/queue/emailWorker";
import { connectToDatabase } from "../src/lib/db/mongoose";

async function main() {
  console.log("==========================================");
  console.log(" NOIR Atelier - BullMQ Email Worker");
  console.log("==========================================");

  await connectToDatabase();
  const worker = startEmailWorker();

  if (!worker) {
    console.log("Worker could not be started. Verify that REDIS_URL is configured in your environment.");
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    console.log("\nReceived SIGINT. Gracefully shutting down worker...");
    await stopEmailWorker();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nReceived SIGTERM. Gracefully shutting down worker...");
    await stopEmailWorker();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Worker process error:", err);
  process.exit(1);
});
