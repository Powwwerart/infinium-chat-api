const setCors = require("./_cors");

module.exports = async function handler(req, res) {
  if (typeof setCors !== "function") {
    return res
      .status(500)
      .json({ error: "setCors is not a function", hint: "Check api/_cors.js export" });
  }

  setCors(req, res, ["GET", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    ok: true,
    service: "infinium-chat-api",
    time: new Date().toISOString(),
  });
};
