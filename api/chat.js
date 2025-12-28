const setCors = require("./_cors");
const { parseRequestBody, sendJson } = require("./_utils");
const OpenAI = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID; // <-- ya no hardcode

const POLL_INTERVAL_MS = 350;
const MAX_WAIT_MS = 20000; // 20s

function extractUserMessage(body) {
  if (!body) return "";
  return (
    body.message ||
    body.text ||
    body.input ||
    body.prompt ||
    (typeof body === "string" ? body : "")
  );
}

function pickTextFromAssistantMessages(messages) {
  const list = messages?.data || [];
  const assistantMsg = list.find((m) => m.role === "assistant") || list[0];
  if (!assistantMsg) return "";

  const parts = assistantMsg.content || [];
  for (const p of parts) {
    if (p.type === "output_text" && p.text) return String(p.text);
    if (p.type === "text" && p.text?.value) return String(p.text.value);
    if (p.text?.value) return String(p.text.value);
    if (typeof p.text === "string") return p.text;
  }

  return assistantMsg?.content?.[0]?.text?.value || "";
}

module.exports = async function handler(req, res) {
  if (typeof setCors !== "function") {
    return sendJson(res, 500, {
      error: "setCors is not a function",
      hint: "Check api/_cors.js export",
    });
  }

  // CORS primero SIEMPRE
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  // Validaciones claras
  if (!OPENAI_API_KEY) {
    return sendJson(res, 500, { error: "Missing OPENAI_API_KEY in Vercel env" });
  }
  if (!ASSISTANT_ID) {
    return sendJson(res, 500, { error: "Missing ASSISTANT_ID in Vercel env" });
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  try {
    const body = await parseRequestBody(req, res);
    if (!body) return;

    const userMessage = extractUserMessage(body).trim();
    if (!userMessage) return sendJson(res, 400, { error: "Missing message/text" });

    // 1) Crear thread
    const thread = await openai.beta.threads.create();

    // 2) Mensaje usuario
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });

    // 3) Run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // 4) Poll
    const started = Date.now();
    while (true) {
      const runResult = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      const status = runResult.status;

      if (status === "completed") break;

      if (status === "requires_action") {
        return sendJson(res, 200, {
          reply:
            "Estoy procesando tu solicitud. Reformúlala o pídela de otra forma (aún no manejo tool-calls aquí).",
          status,
        });
      }

      if (status === "failed" || status === "cancelled" || status === "expired" || status === "incomplete") {
        return sendJson(res, 500, { error: "Assistant did not complete", status });
      }

      if (Date.now() - started > MAX_WAIT_MS) {
        return sendJson(res, 504, { error: "Assistant timeout", status });
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    // 5) Respuesta
    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = pickTextFromAssistantMessages(messages) || "Listo.";

    return sendJson(res, 200, { ok: true, reply });
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown server error";

    // OJO: si OpenAI devuelve 404, tú lo verás aquí (assistant no accesible)
    const status = err?.status || err?.response?.status || 500;

    return sendJson(res, status, { error: "Chat failed", message: msg });
  }
};
