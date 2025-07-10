import { sendToProcessor } from "../core/processor.js";
import { purgeProcessors } from "../core/admin.js";
import { savePayment, getSummary, hasCorrelation, registerCorrelation, resetRedis } from "../store/redis.js";

export default function routes(app) {
  app.get("/", () => "Rinha 2025 🐔");

  app.post("/payments", async ({ body, set }) => {
    const { correlationId, amount } = body || {};
    const requestedAt = new Date().toISOString();

    if (
      !correlationId ||
      typeof correlationId !== "string" ||
      !amount ||
      typeof amount !== "number"
    ) {
      set.status = 400;
      return { error: "Invalid payload" };
    }

    try {
      const exists = await hasCorrelation(correlationId);
      if (exists) {
        set.status = 409;
        return { error: "Payment already processed" };
      }

      const processor = await sendToProcessor({ correlationId, amount, requestedAt });
      await registerCorrelation(correlationId);
      await savePayment(processor, amount, requestedAt);

      set.status = 202;
      return { message: "Accepted", processor };
    } catch (err) {
      console.error("Failed to process:", err.message);
      set.status = 500;
      return { error: "Internal error" };
    }
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
