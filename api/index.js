const setCors = require("./_cors");
const { sendJson } = require("./_utils");

const ROUTES = ["/api/ping", "/api/health", "/api/chat", "/api/event", "/api/message"];

module.exports = function handler(req, res) {
  if (typeof setCors !== "function") {
    return sendJson(res, 500, {
      error: "setCors is not a function",
      hint: "Check api/_cors.js export",
    });
  }

  setCors(req, res, ["GET", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  return sendJson(res, 200, {
    ok: true,
    name: "infinium-chat-api",
    routes: ROUTES,
    tip: "Use POST /api/chat (o /api/message) para enviar mensajes.",
  });
};
