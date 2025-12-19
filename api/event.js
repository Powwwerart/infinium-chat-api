const { setCors } = require("./_cors");

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
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

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const payload = body ?? {};

  console.log("EVENT RECEIVED:", payload);

  if (!webhookUrl) {
    return res.status(200).json({ ok: true });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let responseData = null;
    const text = await response.text();
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch {
      responseData = text || null;
    }

    return res.status(response.ok ? 200 : response.status).json({
      ok: response.ok,
      status: response.status,
      data: responseData,
    });
  } catch (error) {
    console.error("EVENT WEBHOOK ERROR:", error);
    return res.status(502).json({
      error: "Webhook forwarding failed",
      message: error.message,
    });
  }
};
