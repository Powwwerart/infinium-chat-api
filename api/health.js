const { initializeSpeedInsights } = require("./_speedInsights");
const { setCors } = require("./_cors");

// Initialize Speed Insights
initializeSpeedInsights();

module.exports = (req, res) => {
  setCors(req, res, ["GET", "OPTIONS"]);

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
