const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  // Opcional: CORS básico (por si luego llamas desde infinium.services)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  // 1) Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2) Body seguro (soporta objeto o string)
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  // Si llegó vacío o raro
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { message, sessionId } = body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing message" });// 🔍 MODO PRUEBA (NO usa OpenAI)
if (message === "__ping__") {
  return res.status(200).json({
    reply: "pong",
    actions: [],
    sessionId: sessionId || null,
  });
}
    
  }

  // 3) API Key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Missing OPENAI_API_KEY in Vercel env" });
  }

  try {
    // 4) Cliente OpenAI
    const client = new OpenAI({ apiKey });

    // 5) Llamada a OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres el asistente de atención a clientes de INFINEUM. Responde claro, profesional y humano. Si te preguntan de salud, evita claims médicos y recomienda consultar un profesional.",
        },
        { role: "user", content: message },
      ],
    });

    return res.status(200).json({
      reply: completion.choices?.[0]?.message?.content ?? "",
      actions: [],
      sessionId: sessionId || null,
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({
      error: "Chat failed",
      message: err?.message,
      name: err?.name,
      status: err?.status,
      code: err?.code,
      type: err?.type,
    });
  }
};
