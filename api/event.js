const setCors = require("./_cors");
const { forwardToN8n, normalizeEvent, parseRequestBody, sendJson } = require("./_utils");

module.exports = async function handler(req, res) {
  if (!setCors(req, res, ["POST", "OPTIONS"])) return;

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = await parseRequestBody(req, res);
  if (!body) return;

  const sessionId = body?.sessionId || body?.session_id || null;
  const page = body?.meta?.page || null;
  console.log(`[event] hit sessionId=${sessionId ?? "n/a"} page=${page ?? "n/a"}`);

  const normalized = normalizeEvent({
    message: body?.message || body?.event || "",
    meta: body?.meta,
    intent: body?.intent || null,
    confidence: typeof body?.confidence === "number" ? body.confidence : 0.0,
    eventType: body?.event_type || "alerta",
  });

  const payload = {
    sessionId,
    ...normalized,
    raw: body,
  };

  try {
    const out = await forwardToN8n(payload);
    return sendJson(res, 200, {
      ok: true,
      forwarded: Boolean(out && !out.skipped),
      n8n_status: out?.status || null,
    });
  } catch (err) {
    console.warn("[event] n8n forward failed", err?.message || err);
    return sendJson(res, 200, { ok: true, forwarded: false });
  }
};
