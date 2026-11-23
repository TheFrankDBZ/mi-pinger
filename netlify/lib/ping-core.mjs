export async function runPing({
  url,
  method = "GET",
  headers = {},
  body = null,
  timeoutMs = 9000,
}) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : body,
      signal: controller.signal,
      redirect: "follow",
    });

    // No necesitamos el cuerpo, solo el estado.
    try {
      await res.body?.cancel();
    } catch {}

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      ms: Date.now() - started,
      error: null,
      at: new Date().toISOString(),
    };
  } catch (err) {
    const timedOut = err.name === "AbortError";
    return {
      ok: false,
      status: null,
      statusText: "",
      ms: Date.now() - started,
      error: timedOut
        ? "Timeout (el servidor puede estar despertando)"
        : err.message,
      at: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}