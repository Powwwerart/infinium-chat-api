const { setCors } = require("./_cors");
 codex/fix-backend-not-connected-state-9865ni
=======
const { isRateLimited } = require("./_rateLimit");
const { forwardToN8n, parseRequestBody, sendJson } = require("./_utils");
 main

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

 codex/fix-backend-not-connected-state-9865ni
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const payload = body ?? {};

  console.log("EVENT RECEIVED:", payload);

  if (!webhookUrl) {
    return res.status(200).json({ ok: true });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let responseData = null;
    const text = await response.text();
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch {
      responseData = text || null;
    }

    return res.status(response.ok ? 200 : response.status).json({
      ok: response.ok,
      status: response.status,
      data: responseData,
    });
=======
  const body = parseRequestBody(req, res);
  if (!body) return;

  const { event, sessionId, meta, data } = body;

  if (typeof event !== "string" || event.trim().length === 0) {
    return sendJson(res, 400, { error: "Invalid event" });
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const normalizedForwardedFor =
    typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : undefined;

  const key = sessionId || normalizedForwardedFor || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(key)) {
    return sendJson(res, 429, { error: "Too many requests. Please slow down." });
  }

  const cleanedMeta = meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {};
  const cleanedData = data && typeof data === "object" && !Array.isArray(data) ? data : {};

  const payload = {
    type: "event",
    event: event.trim(),
    sessionId: sessionId || null,
    meta: cleanedMeta,
    data: cleanedData,
  };

  if (!process.env.N8N_WEBHOOK_URL) {
    return sendJson(res, 200, { ok: true, message: "event accepted (n8n not configured yet)" });
  }

  try {
    const { data, status } = await forwardToN8n(payload);
    return sendJson(res, status, data);
 main
  } catch (error) {
    const status = error.statusCode || error.status || 502;
    return sendJson(res, status, {
      error: "Event forwarding failed",
      message: error.message,
    });
  }
};
