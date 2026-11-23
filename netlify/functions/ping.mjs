import { runPing } from "../lib/ping-core.mjs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const ALLOWED_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"];

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Usa POST" }, 405);

  // Sin lista de hosts permitidos, esto sería un proxy abierto para cualquiera.
  const allowedHosts = (process.env.ALLOWED_HOSTS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedHosts.length) {
    return json({ error: "Falta configurar ALLOWED_HOSTS en Netlify" }, 500);
  }

  const panelToken = process.env.PANEL_TOKEN;
  if (panelToken && req.headers.get("x-panel-token") !== panelToken) {
    return json({ error: "Token del panel inválido" }, 401);
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const { url, method = "GET", headers = {}, body = null } = payload;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return json({ error: "URL inválida" }, 400);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return json({ error: "Solo se permite http o https" }, 400);
  }

  if (!allowedHosts.includes(parsed.hostname.toLowerCase())) {
    return json({ error: `Host no permitido: ${parsed.hostname}` }, 403);
  }

  const upperMethod = String(method).toUpperCase();
  if (!ALLOWED_METHODS.includes(upperMethod)) {
    return json({ error: "Método no permitido" }, 400);
  }

  const safeHeaders =
    headers && typeof headers === "object" && !Array.isArray(headers)
      ? headers
      : {};

  const result = await runPing({
    url: parsed.toString(),
    method: upperMethod,
    headers: safeHeaders,
    body,
    timeoutMs: 9000,
  });

  return json(result);
};

export const config = {
  path: "/api/ping",
};