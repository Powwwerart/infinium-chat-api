const setCors = require("./_cors");
const { parseRequestBody, sendJson, forwardToN8n } = require("./_utils");

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await parseRequestBody(req, res);
    if (!body) return;

    const sessionId = body?.sessionId || body?.session_id || null;
    const page = body?.meta?.page || null;
    console.log(`[event] hit sessionId=${sessionId ?? "n/a"} page=${page ?? "n/a"}`);

    // forwardToN8n puede fallar si N8N_WEBHOOK_URL/SECRET no existen
    const out = await forwardToN8n(body);

    return sendJson(res, 200, {
      ok: true,
      forwarded: true,
      n8n_status: out?.status,
      n8n_data: out?.data,
    });
  } catch (err) {
    const msg = err?.message || "Event failed";
    const status = err?.statusCode || err?.status || 500;

    return sendJson(res, status, { ok: false, error: "Event failed", message: msg });
  }
};
