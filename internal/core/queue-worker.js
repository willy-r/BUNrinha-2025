import Redis from "ioredis";
import { hasCorrelation, registerCorrelation, savePayment } from "../store/redis.js";
import { getProcessorClient } from "./processor-client.js";

const redis = new Redis(process.env.REDIS_URL);
const QUEUE_KEY = "queue:payments";

export async function processNextPayment() {
  const item = await redis.brpop(QUEUE_KEY, 5);
  if (!item) return;

  const [, raw] = item;
  const payment = JSON.parse(raw);
  const { correlationId, amount, requestedAt } = payment;

  const exists = await hasCorrelation(correlationId);
  if (exists) return;

  const processor = await getProcessorClient().send(payment);

  await registerCorrelation(correlationId);
  await savePayment(processor, amount, requestedAt);

  console.log("✅ Processed:", correlationId, "via", processor);
}
