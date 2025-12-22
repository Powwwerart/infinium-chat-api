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
    const error = new Error("Missing N8N_WEBHOOK_URL");
    error.statusCode = 500;
    throw error;
  }

  if (!secret) {
    const error = new Error("Missing N8N_WEBHOOK_SECRET");
    error.statusCode = 500;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-infinium-secret": secret,
      },
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

module.exports = {
  forwardToN8n,
  parseRequestBody,
  sendJson,
};
