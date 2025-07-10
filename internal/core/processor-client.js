const DEFAULT = process.env.PROCESSOR_DEFAULT;
const FALLBACK = process.env.PROCESSOR_FALLBACK;

let lastCheck = 0;
let cache = {};

export function getProcessorClient() {
  return {
    async send(payment) {
      const best = await selectProcessor();
      const res = await sendToProcessor(best, payment);
      if (res) return best;

      // fallback
      const alt = best === "default" ? "fallback" : "default";
      const fallbackRes = await sendToProcessor(alt, payment);
      if (fallbackRes) return alt;

      throw new Error("Both processors failed");
    }
  };
}

async function sendToProcessor(processor, payment) {
  const url = processor === "default" ? DEFAULT : FALLBACK;

  try {
    const res = await fetch(url + "/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });

    if (res.ok) return true;

    if (res.status === 429) {
      const retry = res.headers.get("Retry-After");
      if (retry) {
        const wait = Number(retry) * 1000;
        console.warn(`[${processor}] Retry-After: ${retry}s`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
    return false;
  } catch (err) {
    console.error(`[${processor}] error:`, err.message);
    return false;
  }
}

async function selectProcessor() {
  const now = Date.now();
  if (now - lastCheck > 5000) {
    const [d, f] = await Promise.all([
      fetch(DEFAULT + "/payments/service-health").then((r) => r.json()).catch(() => ({ failing: true, minResponseTime: Infinity })),
      fetch(FALLBACK + "/payments/service-health").then((r) => r.json()).catch(() => ({ failing: true, minResponseTime: Infinity })),
    ]);

    cache = { default: d, fallback: f };
    lastCheck = now;
  }

  if (!cache.default.failing && (cache.default.minResponseTime <= cache.fallback.minResponseTime || cache.fallback.failing)) {
    return "default";
  }
  return "fallback";
}
