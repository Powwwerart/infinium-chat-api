const { initializeSpeedInsights } = require("./_speedInsights");
const { setCors } = require("./_cors");
const { isRateLimited } = require("./_rateLimit");
const { forwardToN8n, parseRequestBody, sendJson } = require("./_utils");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = "asst_rHXdB7U47CNanDF6kjrtlpzw";

// Initialize Speed Insights
initializeSpeedInsights();

function getClientKey(req, sessionId) {
  if (sessionId) return sessionId;

  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.socket?.remoteAddress || "unknown";
}

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = await parseRequestBody(req, res);
  if (!body) return;

  const { message, sessionId = null, meta, timestamp, ...rest } = body;

  if (typeof message !== "string" || message.trim().length === 0) {
    return sendJson(res, 400, { error: "Invalid message" });
  }

  const rateLimitKey = getClientKey(req, sessionId);
  if (isRateLimited(rateLimitKey)) {
    return sendJson(res, 429, { error: "Too many requests. Please slow down." });
  }

  const payload = {
    ...rest,
    type: "chat",
    message,
    sessionId,
    meta,
    timestamp: timestamp || new Date().toISOString(),
  };

  const userMessage = body.message || body.text;

  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userMessage,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: ASSISTANT_ID,
  });

let status = "queued";
let runResult;

while (true) {
  runResult = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  status = runResult.status;

  if (status === "completed") break;

  if (
    status === "failed" ||
    status === "cancelled" ||
    status === "expired" ||
    status === "incomplete"
  ) {
    return sendJson(res, 500, {
      error: "Assistant did not complete",
      status,
    });
  }

  if (status === "requires_action") {
    return sendJson(res, 200, {
      reply: "Estoy procesando tu solicitud, ¿puedes reformularla?",
    });
  }

  await new Promise(r => setTimeout(r, 400));
}

  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const reply = messages.data[0].content[0].text.value;

  return sendJson(res, 200, { reply });
};
