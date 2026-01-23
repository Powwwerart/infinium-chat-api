const DEFAULT_TIMEOUT_MS = 10_000;

function parseRequestBody(req, res) {
  let body;

  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return null;
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ error: "Invalid JSON body" });
    return null;
  }

  return body;
}

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

async function forwardToN8n(payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    return { skipped: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (secret) {
      headers["x-infinium-secret"] = secret;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Request to automation timed out");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    error.statusCode = error.statusCode || error.status || 502;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeEvent({ message, meta, intent, confidence, eventType }) {
  const rawMeta = meta && typeof meta === "object" ? meta : {};
  const allowedTypes = new Set(["lead", "error", "venta", "alerta"]);
  const resolvedType = allowedTypes.has(eventType) ? eventType : "lead";

  return {
    event_type: resolvedType,
    source: "web",
    project: "INFINIUM",
    user: {
      name: null,
      contact: null,
    },
    intent: intent || null,
    confidence: typeof confidence === "number" ? confidence : 0.0,
    priority: "low",
    message: message || "",
    meta: {
      site_id: rawMeta.site_id || "",
      campaign_id: rawMeta.campaign_id || "",
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  forwardToN8n,
  normalizeEvent,
  parseRequestBody,
  sendJson,
};
