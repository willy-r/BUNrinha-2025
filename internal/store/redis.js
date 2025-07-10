import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

const CORR_SET = "set:correlation";
const QUEUE_KEY = "queue:payments";

export async function savePayment(processor, amount, requestedAt) {
  const key = "payments:" + processor;
  await redis.rpush(key, JSON.stringify({ amount, requestedAt }));
}

export async function getSummary(from, to) {
  const result = {};

  for (const proc of ["default", "fallback"]) {
    const list = await redis.lrange("payments:" + proc, 0, -1);
    const filtered = list
      .map((x) => JSON.parse(x))
      .filter((p) => {
        const t = new Date(p.requestedAt).getTime();
        return (!from || t >= new Date(from).getTime()) &&
          (!to || t <= new Date(to).getTime());
      });

    result[proc] = {
      totalRequests: filtered.length,
      totalAmount: Number(
        filtered.reduce((sum, x) => sum + x.amount, 0).toFixed(2)
      ),
    };
  }

  return result;
}

export async function hasCorrelation(correlationId) {
  return await redis.sismember(CORR_SET, correlationId);
}

export async function registerCorrelation(correlationId) {
  return await redis.sadd(CORR_SET, correlationId);
}

export async function resetRedis() {
  const keys = await redis.keys("payments:*");
  if (keys.length > 0) await redis.del(...keys);
  await redis.del("set:correlation");
}

export async function enqueuePayment(payment) {
  await redis.lpush(QUEUE_KEY, JSON.stringify(payment));
}
