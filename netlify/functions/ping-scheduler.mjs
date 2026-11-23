import { runPing } from "../lib/ping-core.mjs";

export default async () => {
  const urls = (process.env.PING_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!urls.length) {
    console.log("[ping-scheduler] PING_URLS está vacío, nada que hacer.");
    return;
  }

  const results = await Promise.all(
    urls.map(async (url) => ({
      url,
      ...(await runPing({ url, timeoutMs: 25000 })),
    }))
  );

  for (const r of results) {
    console.log(
      `[ping-scheduler] ${r.ok ? "OK" : "FAIL"} ${r.url} status=${r.status} ${r.ms}ms ${r.error ?? ""}`
    );
  }
};

export const config = {
  schedule: "*/10 * * * *",
};