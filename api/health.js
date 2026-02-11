const setCors = require("./_cors");

module.exports = (req, res) => {
  if (!setCors(req, res, ["GET", "OPTIONS"])) return;

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    ok: true,
    service: "infinium-chat-api",
    n8n: {
      webhookUrlConfigured: Boolean(process.env.N8N_WEBHOOK_URL),
      webhookSecretConfigured: Boolean(process.env.N8N_WEBHOOK_SECRET),
    },
    ts: new Date().toISOString(),
  });
};
