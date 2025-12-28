const setCors = require("./_cors");
const { parseRequestBody, sendJson } = require("./_utils");
const OpenAI = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID; // <-- ya no hardcode

const POLL_INTERVAL_MS = 350;
const MAX_WAIT_MS = 20000; // 20s
const BUY_URL = "https://vitalhealthglobal.com/collections/all?refID=145748";

const ACTIONS = {
  buy: {
    type: "open_url",
    label: "Comprar ahora",
    url: BUY_URL,
  },
  whatsappEs: {
    type: "whatsapp",
    label: "WhatsApp (Español)",
    phone: "19565505115",
    text: "Hola, vengo de INFINIUM...",
  },
  whatsappEn: {
    type: "whatsapp",
    label: "WhatsApp (English)",
    phone: "19564421379",
    text: "Hello, I came from INFINIUM...",
  },
  joinEs: {
    type: "whatsapp",
    label: "WhatsApp (Español)",
    phone: "19565505115",
    text: "Hola, vengo de INFINIUM y quiero unirme como afiliado.",
  },
  joinEn: {
    type: "whatsapp",
    label: "WhatsApp (English)",
    phone: "19564421379",
    text: "Hello, I came from INFINIUM and want to join as an affiliate.",
  },
};

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

function includesWord(input, word) {
  return new RegExp(`\\b${word}\\b`, "i").test(input);
}

function detectEnglish(message) {
  const keywords = ["hello", "hi", "help", "buy", "join", "order"];
  return keywords.some((word) => includesWord(message, word));
}

function detectIntent(message) {
  const buyTerms = ["comprar", "precio", "orden", "order", "buy", "purchase", "checkout"];
  const supportTerms = ["whatsapp", "wsp", "asesor", "advisor", "support", "ayuda", "help"];
  const joinTerms = ["unirme", "afiliar", "negocio", "comision", "team", "join", "affiliate"];

  if (buyTerms.some((word) => includesWord(message, word))) return "buy";
  if (supportTerms.some((word) => includesWord(message, word))) return "support";
  if (joinTerms.some((word) => includesWord(message, word))) return "join";
  return "unknown";
}

function buildActions(intent, isEnglish) {
  const primaryWhatsApp = isEnglish ? ACTIONS.whatsappEn : ACTIONS.whatsappEs;
  const secondaryWhatsApp = isEnglish ? ACTIONS.whatsappEs : ACTIONS.whatsappEn;
  const joinPrimary = isEnglish ? ACTIONS.joinEn : ACTIONS.joinEs;
  const joinSecondary = isEnglish ? ACTIONS.joinEs : ACTIONS.joinEn;

  if (intent === "buy") {
    return [ACTIONS.buy, primaryWhatsApp, secondaryWhatsApp];
  }

  if (intent === "support") {
    return [primaryWhatsApp, secondaryWhatsApp, ACTIONS.buy];
  }

  if (intent === "join") {
    return [joinPrimary, joinSecondary];
  }

  return [primaryWhatsApp, ACTIONS.buy];
}

function needsMedicalDisclaimer(message) {
  const terms = ["curar", "diagnosticar", "medicamento", "enfermedad"];
  return terms.some((word) => includesWord(message, word));
}

function appendDisclaimer(reply, isEnglish, includeDisclaimer) {
  if (!includeDisclaimer) return reply;
  const disclaimer = isEnglish
    ? "Note: I can’t provide medical diagnosis or treatment advice."
    : "Aviso: no puedo ofrecer diagnósticos ni recomendaciones médicas.";
  return `${reply}\n\n${disclaimer}`.trim();
}

module.exports = async function handler(req, res) {
  // CORS primero SIEMPRE
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  // Validaciones claras
  if (!OPENAI_API_KEY) {
    return sendJson(res, 500, {
      ok: false,
      error: "Missing OPENAI_API_KEY in Vercel env",
    });
  }
  if (!ASSISTANT_ID) {
    return sendJson(res, 500, {
      ok: false,
      error: "Missing ASSISTANT_ID in Vercel env",
    });
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  let intent = "unknown";
  let actions = buildActions(intent, false);
  let isEnglish = false;

  try {
    const body = await parseRequestBody(req, res);
    if (!body) return;

    const userMessage = extractUserMessage(body).trim();
    if (!userMessage) {
      return sendJson(res, 400, { ok: false, error: "Missing message/text" });
    }

    isEnglish = detectEnglish(userMessage);
    intent = detectIntent(userMessage);
    actions = buildActions(intent, isEnglish);

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
        const fallbackReply = isEnglish
          ? "I'm processing your request. Please rephrase it for now."
          : "Estoy procesando tu solicitud. Reformúlala o pídela de otra forma (aún no manejo tool-calls aquí).";
        return sendJson(res, 200, {
          ok: true,
          reply: fallbackReply,
          intent,
          actions,
          status,
        });
      }

      if (status === "failed" || status === "cancelled" || status === "expired" || status === "incomplete") {
        return sendJson(res, 500, {
          ok: false,
          error: "Assistant did not complete",
          intent,
          status,
        });
      }

      if (Date.now() - started > MAX_WAIT_MS) {
        return sendJson(res, 504, {
          ok: false,
          error: "Assistant timeout",
          intent,
          status,
        });
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    // 5) Respuesta
    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = pickTextFromAssistantMessages(messages) || "Listo.";
    const finalReply = appendDisclaimer(reply, isEnglish, needsMedicalDisclaimer(userMessage));

    return sendJson(res, 200, { ok: true, reply: finalReply, intent, actions });
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown server error";

    // OJO: si OpenAI devuelve 404, tú lo verás aquí (assistant no accesible)
    const status = err?.status || err?.response?.status || 500;

    return sendJson(res, status, {
      ok: false,
      error: "Chat failed",
      message: msg,
      intent,
    });
  }
};
