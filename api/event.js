const DEFAULT_ORIGIN = "https://infinium.services";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", DEFAULT_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: "Missing N8N_WEBHOOK_URL" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });

    let responseData = null;
    const text = await response.text();
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch {
      responseData = text || null;
    }

    return res.status(response.status).json({
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
