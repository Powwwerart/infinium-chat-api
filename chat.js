const OpenAI = require("openai");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST /api/chat" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const message = (body?.message || "").toString().trim();

    if (!message) return res.status(400).json({ error: "Missing message" });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY missing in Vercel" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // OJO: si tu cuenta aún no tiene créditos, aquí puede salir 429 insufficient_quota
    const r = await client.responses.create({
      model: "gpt-5-mini",
      input: message
    });

    return res.status(200).json({ reply: r.output_text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err?.message || "server_error" });
  }
};
