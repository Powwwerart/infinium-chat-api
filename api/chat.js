const { setCors } = require("./_cors");
const { isRateLimited } = require("./_rateLimit");
const { forwardToN8n, parseRequestBody, sendJson } = require("./_utils");

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = parseRequestBody(req, res);
  if (!body) return; // parseRequestBody already responded

  const { message, sessionId, meta } = body;

  if (typeof message !== "string" || message.trim().length === 0) {
    return sendJson(res, 400, { error: "Invalid message" });
  }

  const key = sessionId || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(key)) {
    return sendJson(res, 429, { error: "Too many requests. Please slow down." });
  }

  const cleanedMeta = meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {};

  const payload = {
    type: "chat",
    message: message.trim(),
    sessionId: sessionId || null,
    meta: cleanedMeta,
  };

  try {
    const { data, status } = await forwardToN8n(payload);
    return sendJson(res, status, data);
  } catch (error) {
    const status = error.statusCode || error.status || 502;
    return sendJson(res, status, {
      error: "Chat forwarding failed",
      message: error.message,
    });
  }
};
