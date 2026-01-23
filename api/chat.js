const setCors = require("./_cors");
const { forwardToN8n, normalizeEvent, parseRequestBody, sendJson } = require("./_utils");

const INTENT_KEYWORDS = {
  buy: ["buy", "comprar", "precio", "order", "checkout"],
  join: ["join", "afiliar", "affiliate", "unirme", "negocio"],
  health: ["health", "salud", "bienestar", "scan", "escaneo"],
  info: ["info", "informacion", "information", "details", "detalles"],
};

function resolveIntent(message) {
  const lowered = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((keyword) => lowered.includes(keyword))) {
      return intent;
    }
  }
  return "random";
}

function buildFallbackReply(intent) {
  const base =
    intent === "buy"
      ? "Puedo ayudarte a elegir una opción de compra."
      : intent === "join"
        ? "Puedo contarte cómo unirte al equipo."
        : intent === "health"
          ? "Puedo orientarte sobre escaneos y bienestar."
          : "Gracias por tu mensaje. Estoy aquí para ayudarte.";

  return `${base} ¿Quieres comprar, agendar un escaneo o hablar con WhatsApp?`;
}

function buildFallbackActions() {
  return ["buy", "scan", "whatsapp"];
}

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const body = await parseRequestBody(req, res);
  if (!body) return;

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

  if (!message) {
    return sendJson(res, 400, { ok: false, error: "missing_message" });
  }

  if (!sessionId) {
    return sendJson(res, 400, { ok: false, error: "missing_session" });
  }

  let intent = resolveIntent(message);
  let confidence = 0.0;
  let reply = buildFallbackReply(intent);
  let actions = buildFallbackActions();

  const normalized = normalizeEvent({
    message,
    meta: body.meta,
    intent,
    confidence,
    eventType: "lead",
  });

  const n8nPayload = {
    sessionId,
    ...normalized,
  };

  try {
    const n8nResult = await forwardToN8n(n8nPayload);
    const data = n8nResult?.data;

    if (data && typeof data === "object") {
      if (typeof data.reply === "string") reply = data.reply;
      if (typeof data.intent === "string") intent = data.intent;
      if (typeof data.confidence === "number") confidence = data.confidence;
      if (Array.isArray(data.actions) && data.actions.length > 0) actions = data.actions;
    }
  } catch (error) {
    console.warn("[chat] n8n forward failed", error?.message || error);
  }

  return sendJson(res, 200, {
    ok: true,
    sessionId,
    intent,
    confidence,
    reply,
    actions,
  });
};
