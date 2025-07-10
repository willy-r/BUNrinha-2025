import { purgeProcessors } from "../core/admin.js";
import { getSummary, resetRedis, enqueuePayment } from "../store/redis.js";

export default function routes(app) {
  app.get("/", () => "Rinha 2025 🐔");

  app.post("/payments", async ({ body, set }) => {
    const { correlationId, amount } = body || {};
    const requestedAt = new Date().toISOString();

    if (
      !correlationId ||
      typeof correlationId !== "string" ||
      typeof amount !== "number"
    ) {
      set.status = 400;
      return { error: "Invalid payload" };
    }

    await enqueuePayment({ correlationId, amount, requestedAt });

    set.status = 202;
    return { message: "Queued" };
  });

  app.get("/payments-summary", async ({ query }) => {
    const { from, to } = query;
    return await getSummary(from, to);
  });

  app.post("/admin/reset", async ({ set }) => {
    try {
      await resetRedis();
      await purgeProcessors();
      return { message: "Reset done" };
    } catch (err) {
      console.error("Reset failed:", err.message);
      set.status = 500;
      return { error: "Reset failed" };
    }
  });
}
