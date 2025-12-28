const setCors = require("./_cors");
const { isRateLimited } = require("./_rateLimit");
const { forwardToN8n, parseRequestBody, sendJson } = require("./_utils");

function getClientKey(req, sessionId) {
  if (sessionId) return sessionId;

  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.socket?.remoteAddress || "unknown";
}

module.exports = async function handler(req, res) {
  if (typeof setCors !== "function") {
    return sendJson(res, 500, {
      error: "setCors is not a function",
      hint: "Check api/_cors.js export",
    });
  }

  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = parseRequestBody(req, res);
  if (!body) return;

  const { message, sessionId = null, meta, timestamp, ...rest } = body;

  if (typeof message !== "string" || message.trim().length === 0) {
    return sendJson(res, 400, { error: "Invalid message" });
  }

  const rateLimitKey = getClientKey(req, sessionId);
  if (isRateLimited(rateLimitKey)) {
    return sendJson(res, 429, { error: "Too many requests. Please slow down." });
  }

  const payload = {
    ...rest,
    type: "chat",
    message,
    sessionId,
    meta,
    timestamp: timestamp || new Date().toISOString(),
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
