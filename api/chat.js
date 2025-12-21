 codex/fix-backend-not-connected-state-9865ni
const OpenAI = require("openai");
const { setCors } = require("./_cors");

function buildActions(message) {
  const normalized = (message || "").toLowerCase();
  const actions = [];

  const addWhatsApp = () => {
    const exists = actions.find((action) => action.label === "WhatsApp");
    if (exists) return;
    actions.push({
      label: "WhatsApp",
      url: "https://wa.me/19548094440?text=Hola%20Infinium%2C%20quiero%20saber%20m%C3%A1s",
      type: "link",
    });
  };

  if (normalized.includes("compra") || normalized.includes("comprar")) {
    actions.push({
      label: "Comprar ahora",
      url: "https://vitalhealthglobal.com/collections/infinium",
      type: "link",
    });
    addWhatsApp();
  }

  if (
    normalized.includes("whatsapp") ||
    normalized.includes("contactar") ||
    normalized.includes("asesor")
  ) {
    addWhatsApp();
  }

  if (
    normalized.includes("unirme") ||
    normalized.includes("afiliar") ||
    normalized.includes("join") ||
    normalized.includes("oportunidad")
  ) {
    actions.push({
      label: "Unirme",
      url: "https://vitalhealthglobal.com/pages/oportunidad",
      type: "link",
    });
    addWhatsApp();
  }

  return actions;
}

module.exports = async function handler(req, res) {
  // ✅ 2) SIEMPRE poner headers CORS al inicio
  setCors(req, res, ["POST", "GET", "OPTIONS"]);
=======
const { setCors } = require("./_cors");
const { isRateLimited } = require("./_rateLimit");
const { forwardToN8n, parseRequestBody, sendJson } = require("./_utils");

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);
 main

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

 codex/fix-backend-not-connected-state-9865ni
  try {
    if (req.method === "GET") {
      return res
        .status(200)
        .json({ ok: true, note: "Use POST to chat" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
=======
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = parseRequestBody(req, res);
  if (!body) return; // parseRequestBody already responded

  const { message, sessionId, meta } = body;
 main

  if (typeof message !== "string" || message.trim().length === 0) {
    return sendJson(res, 400, { error: "Invalid message" });
  }

 codex/fix-backend-not-connected-state-9865ni
    const { message, sessionId, meta } = body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }
=======
  const forwardedFor = req.headers["x-forwarded-for"];
  const normalizedForwardedFor =
    typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : undefined;
 main

  const key = sessionId || normalizedForwardedFor || req.socket?.remoteAddress || "unknown";
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

 codex/fix-backend-not-connected-state-9865ni
    const actions = buildActions(message);

    const metaContext = meta
      ? `Contexto de usuario y utms: ${JSON.stringify(meta)}`
      : "Sin metadatos de campaña";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "Eres el asistente de atención a clientes de INFINEUM.",
            "Responde en tono claro, profesional y humano.",
            "Si el usuario pide comprar, unirse o contactar, invita a usar las acciones proporcionadas y complementa con un breve resumen.",
            metaContext,
          ].join(" "),
=======
  if (!process.env.N8N_WEBHOOK_URL) {
    return sendJson(res, 200, {
      reply: "Sistema en configuración. Ya recibí tu mensaje. En breve te atiendo.",
      actions: [
        {
          type: "whatsapp",
          label: "WhatsApp",
          phone: "19565505115",
          text: "Hola, vengo de INFINEUM. Quiero información.",
 main
        },
      ],
    });
  }

 codex/fix-backend-not-connected-state-9865ni
    return res.status(200).json({
      reply: completion.choices[0].message.content,
      actions,
      sessionId: sessionId || null,
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({
      error: "Chat failed",
      message: err.message,
      status: err.status,
      code: err.code,
=======
  try {
    const { data, status } = await forwardToN8n(payload);
    return sendJson(res, status, data);
  } catch (error) {
    const status = error.statusCode || error.status || 502;
    return sendJson(res, status, {
      error: "Chat forwarding failed",
      message: error.message,
 main
    });
  }
};
