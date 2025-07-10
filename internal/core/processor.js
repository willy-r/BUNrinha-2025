async function trySend(url, payment) {
  try {
    const res = await fetch(url + "/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendToProcessor(payment) {
  const DEFAULT = process.env.PROCESSOR_DEFAULT;
  const FALLBACK = process.env.PROCESSOR_FALLBACK;

  for (let i = 0; i < 2; i++) {
    if (await trySend(DEFAULT, payment)) return "default";
    await new Promise((r) => setTimeout(r, 50 * (i + 1)));
  }

  if (await trySend(FALLBACK, payment)) return "fallback";

  throw new Error("Both processors failed");
}
