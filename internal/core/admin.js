const ADMIN_TOKEN = "123";
const DEFAULT = process.env.PROCESSOR_DEFAULT;

export async function purgeProcessors() {
  const headers = { "X-Rinha-Token": ADMIN_TOKEN };
  const options = { method: "POST", headers };

  const res = await fetch(DEFAULT + "/admin/purge-payments", options);
  if (!res.ok) {
    throw new Error("Failed to purge default processor");
  }
}
