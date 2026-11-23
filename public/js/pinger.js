import { storage } from "./storage.js";

const timers = new Map();

export async function pingTarget(target) {
  const started = Date.now();
  const base = { targetId: target.id, name: target.name, url: target.url };

  try {
    const token = storage.getToken();
    const res = await fetch("/api/ping", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { "x-panel-token": token } : {}),
      },
      body: JSON.stringify({
        url: target.url,
        method: target.method,
        headers: target.headers,
        body: target.body,
      }),
    });

    const data = await res.json();

    if (res.ok) return { ...base, ...data };

    // El proxy rechazó la petición (token, host no permitido, etc.)
    return {
      ...base,
      ok: false,
      status: null,
      statusText: "",
      ms: Date.now() - started,
      error: data.error || `El proxy respondió ${res.status}`,
      at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ...base,
      ok: false,
      status: null,
      statusText: "",
      ms: Date.now() - started,
      error: `No se pudo contactar la función: ${err.message}`,
      at: new Date().toISOString(),
    };
  }
}

export function startTarget(target, onResult) {
  stopTarget(target.id);

  const run = async () => onResult(await pingTarget(target));

  run();
  timers.set(target.id, setInterval(run, target.intervalMin * 60 * 1000));
}

export function stopTarget(id) {
  clearInterval(timers.get(id));
  timers.delete(id);
}

export function isRunning(id) {
  return timers.has(id);
}