import { processNextPayment } from "../../internal/core/queue-worker.js";

console.log("🧵 Worker started...");

while (true) {
  try {
    await processNextPayment();
  } catch (err) {
    console.error("Worker error:", err.message);
    await new Promise((r) => setTimeout(r, 100));
  }
}
