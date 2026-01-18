const setCors = require("./_cors");
const { parseRequestBody, sendJson } = require("./_utils");
const { handleUserMessage } = require("./commandChain");
const OpenAI = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

const POLL_INTERVAL_MS = 350;
const MAX_WAIT_MS = 20000; // 20s
 codex/add-scan-support-to-chat-api-flgzux
const CHECKOUT_URL = process.env.CHECKOUT_URL || "https://infinium.services/";
const SCAN_SCHEDULE_URL =
  process.env.SCAN_SCHEDULE_URL || "https://infinium.services/scan.html";
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || "19565505115";
const WHATSAPP_TEXT =
  process.env.WHATSAPP_TEXT || "Hola, vengo de INFINIUM. Quiero ayuda para elegir una opción.";
const SCAN_WHATSAPP_TEXT =
  process.env.SCAN_WHATSAPP_TEXT || "Hola, quiero agendar un escaneo.";

const BUY_URL = "https://vitalhealthglobal.com/collections/all?refID=145748";
const SCAN_SCHEDULE_URL =
  process.env.SCAN_SCHEDULE_URL || "https://infinium.services/scan.html";
const SCAN_WHATSAPP_PHONE_ES = process.env.SCAN_WHATSAPP_PHONE_ES || "19565505115";
codex/add-scan-support-to-chat-api-ix4s67
const SCAN_WHATSAPP_TEXT_ES =
  process.env.SCAN_WHATSAPP_TEXT_ES ||
  "Hola, vengo de INFINIUM. Quiero agendar un escaneo.";

const SCAN_WHATSAPP_PHONE_EN = process.env.SCAN_WHATSAPP_PHONE_EN || "19564421379";
const SCAN_WHATSAPP_TEXT_ES =
  process.env.SCAN_WHATSAPP_TEXT_ES ||
  "Hola, vengo de INFINIUM. Quiero agendar un escaneo.";
const SCAN_WHATSAPP_TEXT_EN =
  process.env.SCAN_WHATSAPP_TEXT_EN ||
  "Hello, I came from INFINIUM. I want to schedule a scan.";
 main

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
  scanSchedule: {
    type: "open_url",
    label: "Agendar escaneo",
    url: SCAN_SCHEDULE_URL,
  },
  scanWhatsAppEs: {
    type: "whatsapp",
codex/add-scan-support-to-chat-api-ix4s67
    label: "Asesor por WhatsApp",
    phone: SCAN_WHATSAPP_PHONE_ES,
    text: SCAN_WHATSAPP_TEXT_ES,
  },

    label: "Asesor (Español)",
    phone: SCAN_WHATSAPP_PHONE_ES,
    text: SCAN_WHATSAPP_TEXT_ES,
  },
  scanWhatsAppEn: {
    type: "whatsapp",
    label: "Advisor (English)",
    phone: SCAN_WHATSAPP_PHONE_EN,
    text: SCAN_WHATSAPP_TEXT_EN,
  },
main
};
 main

const ERROR_REPLY = "Disculpa, estoy reconectando...";

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
  const keywords = ["hello", "hi", "help", "buy", "join", "order", "scan", "schedule", "appointment"];
  return keywords.some((word) => includesWord(message, word));
}

function detectIntent(message) {
 codex/add-scan-support-to-chat-api-flgzux
  const scanTerms = ["escaneo", "escáner", "scan", "scanner", "agendar", "cita", "appointment"];
  if (scanTerms.some((word) => includesWord(message, word))) return "scan";
  return "general";
}

function buildCloseActions(intent) {
  const whatsappText = intent === "scan" ? SCAN_WHATSAPP_TEXT : WHATSAPP_TEXT;
  return [
    {
      type: "open_url",
      label: "Compra ya",
      url: CHECKOUT_URL,
    },
    {
      type: "open_url",
      label: "Agenda escaneo",
      url: SCAN_SCHEDULE_URL,
    },
    {
      type: "whatsapp",
      label: "Asesor (WhatsApp)",
      phone: WHATSAPP_PHONE,
      text: whatsappText,
    },
  ];

  const buyTerms = ["comprar", "precio", "orden", "order", "buy", "purchase", "checkout"];
codex/add-scan-support-to-chat-api-ix4s67
  const scanTerms = ["escaneo", "escáner", "scan", "scanner", "agendar", "cita", "appointment"];

  const scanTerms = ["escaneo", "scan", "scanner", "escáner", "cita", "agendar", "agenda", "appointment"];
main
  const supportTerms = ["whatsapp", "wsp", "asesor", "advisor", "support", "ayuda", "help"];
  const joinTerms = ["unirme", "afiliar", "negocio", "comision", "team", "join", "affiliate"];

  if (buyTerms.some((word) => includesWord(message, word))) return "buy";
  if (scanTerms.some((word) => includesWord(message, word))) return "scan";
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

  if (intent === "scan") {
    return [
      ACTIONS.scanSchedule,
codex/add-scan-support-to-chat-api-ix4s67
      ACTIONS.scanWhatsAppEs,

      isEnglish ? ACTIONS.scanWhatsAppEn : ACTIONS.scanWhatsAppEs,
      isEnglish ? ACTIONS.whatsappEn : ACTIONS.whatsappEs,
main
    ];
  }

  return [primaryWhatsApp, ACTIONS.buy];
 main
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

function maskAssistantId(value) {
  if (!value) return "missing";
  return value.slice(0, 8);
}

function hasOpenAiConfig() {
  return Boolean(OPENAI_API_KEY && OPENAI_ASSISTANT_ID);
}

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  const origin = req.headers.origin || "unknown";
  console.info(`[chat] start origin=${origin}`);
  console.info(
    `[chat] env openaiKey=${Boolean(OPENAI_API_KEY)} assistantId=${maskAssistantId(
      OPENAI_ASSISTANT_ID
    )}`
  );

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { ok: false, reply: ERROR_REPLY, error: "method_not_allowed" });
  }

  let intent = "general";
  let actions = buildCloseActions(intent);
  let isEnglish = false;

  try {
    const body = await parseRequestBody(req, res);
    if (!body) return;

    const sessionId = body?.sessionId || body?.session_id || null;
    const page = body?.meta?.page || null;
    console.log(`[chat] hit sessionId=${sessionId ?? "n/a"} page=${page ?? "n/a"}`);

    const userMessage = extractUserMessage(body).trim();
    if (!userMessage) {
      return sendJson(res, 400, { ok: false, reply: ERROR_REPLY, error: "missing_message" });
    }

    const lockedReply = handleUserMessage(userMessage);
    if (lockedReply) {
      isEnglish = detectEnglish(userMessage);
      intent = detectIntent(userMessage);
 codex/add-scan-support-to-chat-api-flgzux
      actions = buildCloseActions(intent);

      actions = buildActions(intent, isEnglish);
 main
      return sendJson(res, 200, { ok: true, reply: lockedReply, mode: "locked", intent, actions });
    }

    if (!hasOpenAiConfig()) {
      return sendJson(res, 500, { ok: false, reply: ERROR_REPLY, error: "missing_env" });
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    isEnglish = detectEnglish(userMessage);
    intent = detectIntent(userMessage);
    actions = buildCloseActions(intent);

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: OPENAI_ASSISTANT_ID,
    });

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

      if (
        status === "failed" ||
        status === "cancelled" ||
        status === "expired" ||
        status === "incomplete"
      ) {
        console.error(`[chat] openai_error status=${status} origin=${origin}`);
        return sendJson(res, 502, {
          ok: false,
          reply: ERROR_REPLY,
          error: "openai_error",
        });
      }

      if (Date.now() - started > MAX_WAIT_MS) {
        console.error(`[chat] openai_timeout origin=${origin}`);
        return sendJson(res, 502, {
          ok: false,
          reply: ERROR_REPLY,
          error: "openai_error",
        });
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = pickTextFromAssistantMessages(messages) || "Listo.";
    const finalReply = appendDisclaimer(reply, isEnglish, needsMedicalDisclaimer(userMessage));

    console.info(`[chat] openai_ok origin=${origin}`);
    return sendJson(res, 200, { ok: true, reply: finalReply, intent, actions });
  } catch (err) {
    const status = err?.status || err?.response?.status || 500;
    console.error("[chat] error", err?.stack || err);

    if (!hasOpenAiConfig()) {
      return sendJson(res, 500, { ok: false, reply: ERROR_REPLY, error: "missing_env" });
    }

    if (status >= 400) {
      return sendJson(res, 502, { ok: false, reply: ERROR_REPLY, error: "openai_error" });
    }

    return sendJson(res, 500, { ok: false, reply: ERROR_REPLY, error: "server_error" });
  }
};
