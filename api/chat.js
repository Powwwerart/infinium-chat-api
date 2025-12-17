const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  // 1️⃣ Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2️⃣ Parse seguro del body
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { message, sessionId } = body || {};

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    // 3️⃣ Llamada a OpenAI
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

    // 4️⃣ Respuesta JSON limpia
    return res.status(200).json({
      reply: completion.choices[0].message.content,
      actions: [],
      sessionId: sessionId || null,
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "OpenAI request failed" });
  }
};
