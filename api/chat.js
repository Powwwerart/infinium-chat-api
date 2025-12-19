const OpenAI = require("openai");
const { setCors } = require("./_cors");

module.exports = async function handler(req, res) {
  // ✅ 2) SIEMPRE poner headers CORS al inicio
  setCors(res, ["POST", "GET", "OPTIONS"]);

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

    const { message, sessionId } = body || {};
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

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres el asistente de atención a clientes de INFINEUM. Responde claro, profesional y humano.",
        },
        { role: "user", content: message },
      ],
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
      actions: [],
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
