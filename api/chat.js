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

  // ✅ 3) Responder preflight ANTES de todo
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method === "GET") {
      return res
        .status(200)
        .json({ ok: true, note: "Use POST to chat" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { message, sessionId, meta } = body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    // 🧪 MODO PRUEBA
    if (message === "__ping__") {
      return res.status(200).json({
        reply: "pong",
        actions: [],
        sessionId: sessionId || null,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const client = new OpenAI({ apiKey });

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
        },
        { role: "user", content: message },
      ],
    });

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
    });
  }
};
