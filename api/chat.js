const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Parse seguro del body 
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { message, sessionId } = body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY in Vercel env" });
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres el asistente de atención a clientes de INFINEUM. Responde claro, profesional y humano.",
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
