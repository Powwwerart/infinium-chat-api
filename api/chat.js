const setCors = require("./_cors");
const { parseRequestBody, sendJson } = require("./_utils");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Pon aquí tu Assistant ID (el de la foto: asst_rHXdB7U47CNanDF6kjrtlpzw)
const ASSISTANT_ID = "asst_rHXdB7U47CNanDF6kjrtlpzw";

// límites para que NO se quede colgado
const POLL_INTERVAL_MS = 350;
const MAX_WAIT_MS = 15000; // 15s (ajústalo si quieres)

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
  // messages.data viene en orden DESC normalmente; agarramos el último que sea assistant
  const list = messages?.data || [];
  const assistantMsg = list.find((m) => m.role === "assistant") || list[0];
  if (!assistantMsg) return "";

  const parts = assistantMsg.content || [];
  // Busca primer bloque tipo output_text/text
  for (const p of parts) {
    // Respuestas nuevas suelen traer:
    // p.type === "output_text" y p.text o p.type === "text" y p.text.value
    if (p.type === "output_text" && p.text) return String(p.text);
    if (p.type === "text" && p.text?.value) return String(p.text.value);
    if (p.text?.value) return String(p.text.value);
    if (typeof p.text === "string") return p.text;
  }

  // fallback
  return assistantMsg?.content?.[0]?.text?.value || "";
}

module.exports = async function handler(req, res) {
  // ✅ CORS SIEMPRE primero, antes de cualquier lógica
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await parseRequestBody(req, res);
    if (!body) return;

    const userMessage = extractUserMessage(body).trim();
    if (!userMessage) {
      return sendJson(res, 400, { error: "Missing message/text" });
    }

    // 1) Crear thread
    const thread = await openai.beta.threads.create();

    // 2) Meter mensaje del usuario
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });

    // 3) Ejecutar el assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // 4) Polling con timeout y estados terminales
    const started = Date.now();
    let runResult = null;

    while (true) {
      runResult = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      const status = runResult.status;

      if (status === "completed") break;

      // Estados terminales que NO deben colgarse
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

      // requires_action = quiso usar tool calls; tu backend no las maneja aquí
      if (status === "requires_action") {
        return sendJson(res, 200, {
          reply:
            "Estoy procesando tu solicitud. ¿Puedes reformularla o pedirlo de otra forma?",
          status,
        });
      }

      if (Date.now() - started > MAX_WAIT_MS) {
        return sendJson(res, 504, {
          error: "Assistant timeout",
          status,
        });
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    // 5) Leer mensajes y extraer respuesta
    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = pickTextFromAssistantMessages(messages) || "Listo.";

    return sendJson(res, 200, { reply });
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown server error";
    const status = err?.status || err?.response?.status || 500;

    return sendJson(res, status, {
      error: "Chat failed",
      message: msg,
    });
  }
};
