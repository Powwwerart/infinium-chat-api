import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: message,
    });

    res.status(200).json({
      reply: response.output_text,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
