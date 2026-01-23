const setCors = require("./_cors");

module.exports = async function handler(req, res) {
  setCors(req, res, ["GET", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionId = req?.query?.sessionId || null;
  const page = req?.query?.page || null;
  console.log(`[ping] hit sessionId=${sessionId ?? "n/a"} page=${page ?? "n/a"}`);

  return res.status(200).json({
    ok: true,
    service: "infinium-chat-api",
    ts: new Date().toISOString(),
  });
};
