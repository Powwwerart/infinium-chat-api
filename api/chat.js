const setCors = require("./_cors");
const { forwardToN8n, normalizeEvent, parseRequestBody, sendJson } = require("./_utils");

const DEFAULT_BUY_URL = "https://vitalhealthglobal.com/collections/all?refID=145748";
const DEFAULT_WHATSAPP_PHONE = "19565505115";
const DISCLAIMER =
  "No hago diagnósticos médicos, pero puedo orientarte sobre suplementos que suelen apoyar procesos naturales del cuerpo.";

const INTENT_CATALOG = [
  {
    key: "energia",
    name: "Energía",
    keywords: ["energia", "energía", "cansancio", "fatiga", "agotado", "sin energia"],
    explanation:
      "Cuando sentimos baja energía, normalmente el cuerpo necesita apoyo en el metabolismo diario y en la producción natural de energía.",
    products: [
      { name: "Complejo B + vitamina C", reason: "apoya el metabolismo energético y la vitalidad diaria." },
      { name: "Coenzima Q10", reason: "contribuye a la producción de energía celular." },
    ],
  },
  {
    key: "estres",
    name: "Estrés / descanso",
    keywords: ["estres", "estrés", "ansiedad", "descanso", "dormir", "insomnio", "tension"],
    explanation:
      "El estrés sostenido puede afectar el descanso y la sensación de calma. Un apoyo nutricional puede ayudar a relajarse.",
    products: [
      { name: "Magnesio", reason: "favorece la relajación muscular y el descanso." },
      { name: "L-teanina", reason: "apoya la sensación de calma sin sedación." },
    ],
  },
  {
    key: "digestion",
    name: "Digestión",
    keywords: ["digestion", "digestión", "estomago", "hinchazon", "inflamado", "acidez"],
    explanation:
      "La digestión puede alterarse por alimentación o ritmo de vida. Hay suplementos que apoyan la comodidad digestiva.",
    products: [
      { name: "Probióticos", reason: "favorecen el equilibrio de la flora intestinal." },
      { name: "Enzimas digestivas", reason: "ayudan al procesamiento de los alimentos." },
    ],
  },
  {
    key: "enfoque",
    name: "Enfoque mental",
    keywords: ["enfoque", "concentracion", "concentración", "memoria", "claridad", "mente"],
    explanation:
      "El enfoque mental suele beneficiarse de nutrientes que apoyan la función cognitiva diaria.",
    products: [
      { name: "Omega 3", reason: "apoya la función cerebral y la claridad mental." },
      { name: "Complejo B", reason: "contribuye al rendimiento mental diario." },
    ],
  },
  {
    key: "peso",
    name: "Control de peso",
    keywords: ["peso", "control de peso", "bajar", "metabolismo", "apetito"],
    explanation:
      "El control de peso depende de hábitos, pero algunos suplementos pueden apoyar el metabolismo y la saciedad.",
    products: [
      { name: "Fibra soluble", reason: "ayuda a la saciedad y al control del apetito." },
      { name: "Té verde", reason: "apoya el metabolismo de forma natural." },
    ],
  },
  {
    key: "articulaciones",
    name: "Articulaciones",
    keywords: ["articulaciones", "rodillas", "dolor articular", "rigidez", "movilidad"],
    explanation:
      "La movilidad diaria puede mejorar con nutrientes que apoyan las articulaciones y la flexibilidad.",
    products: [
      { name: "Colágeno hidrolizado", reason: "apoya la estructura y elasticidad articular." },
      { name: "MSM", reason: "acompaña la comodidad en el movimiento." },
    ],
  },
  {
    key: "bienestar",
    name: "Bienestar general",
    keywords: ["bienestar", "salud", "equilibrio", "general", "mejorar"],
    explanation:
      "Para el bienestar general, un apoyo integral de nutrientes ayuda a mantener el equilibrio diario.",
    products: [
      { name: "Multivitamínico", reason: "cubre necesidades básicas de vitaminas y minerales." },
      { name: "Omega 3", reason: "apoya funciones esenciales del cuerpo." },
    ],
  },
  {
    key: "defensas",
    name: "Defensas",
    keywords: ["defensas", "inmunidad", "resfriados", "defensa", "inmunologico", "inmunológico"],
    explanation:
      "Las defensas naturales se benefician de nutrientes que apoyan la respuesta del cuerpo día a día.",
    products: [
      { name: "Vitamina C + Zinc", reason: "apoyan el funcionamiento normal del sistema inmune." },
      { name: "Vitamina D", reason: "contribuye a la respuesta natural del cuerpo." },
    ],
  },
  {
    key: "piel",
    name: "Piel / colágeno",
    keywords: ["piel", "colageno", "colágeno", "cabello", "uñas", "elasticidad"],
    explanation:
      "La piel y el colágeno requieren nutrientes que favorezcan la hidratación y la elasticidad.",
    products: [
      { name: "Colágeno hidrolizado", reason: "apoya la elasticidad y firmeza de la piel." },
      { name: "Biotina", reason: "acompaña la salud de piel, cabello y uñas." },
    ],
  },
];

function getBuyUrl() {
  return process.env.BUY_URL || DEFAULT_BUY_URL;
}

function getWhatsappUrl() {
  const phone = process.env.WHATSAPP_PHONE || DEFAULT_WHATSAPP_PHONE;
  return `https://wa.me/${phone}`;
}

function normalizeText(text) {
  return text.toLowerCase();
}

function resolveIntent(message) {
  const lowered = normalizeText(message);
  let best = null;
  let bestScore = 0;

  for (const intent of INTENT_CATALOG) {
    const score = intent.keywords.reduce(
      (count, keyword) => (lowered.includes(keyword) ? count + 1 : count),
      0
    );
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  if (!best) {
    const fallback = INTENT_CATALOG.find((intent) => intent.key === "bienestar");
    return { intent: fallback, confidence: 0.45 };
  }

  const confidence = Math.min(0.95, 0.6 + bestScore * 0.1);
  return { intent: best, confidence };
}

function buildReply(intentConfig, buyUrl, whatsappUrl) {
  const products = intentConfig.products
    .slice(0, 2)
    .map((product) => `• ${product.name}: ${product.reason}`)
    .join("\n");

  return [
    `${DISCLAIMER}`,
    `${intentConfig.explanation}`,
    `Opciones recomendadas para ${intentConfig.name.toLowerCase()}:`,
    products,
    "Si quieres, puedo ayudarte a elegir el mejor para ti.",
    `Compra aquí: ${buyUrl}`,
    `WhatsApp: ${whatsappUrl}`,
  ].join("\n");
}

function ensureLinksInReply(reply, buyUrl, whatsappUrl) {
  let enriched = reply;
  if (!enriched.includes(buyUrl)) {
    enriched = `${enriched}\nCompra aquí: ${buyUrl}`;
  }
  if (!enriched.includes(whatsappUrl)) {
    enriched = `${enriched}\nWhatsApp: ${whatsappUrl}`;
  }
  if (!enriched.toLowerCase().includes("diagnóstic")) {
    enriched = `${DISCLAIMER}\n${enriched}`;
  }
  return enriched;
}

function buildActions() {
  return ["buy", "whatsapp"];
}

module.exports = async function handler(req, res) {
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const body = await parseRequestBody(req, res);
  if (!body) return;

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

  if (!message) {
    return sendJson(res, 400, { ok: false, error: "missing_message" });
  }

  if (!sessionId) {
    return sendJson(res, 400, { ok: false, error: "missing_session" });
  }

  const buyUrl = getBuyUrl();
  const whatsappUrl = getWhatsappUrl();
  const resolved = resolveIntent(message);

  let intent = resolved.intent.key;
  let confidence = resolved.confidence;
  let reply = buildReply(resolved.intent, buyUrl, whatsappUrl);
  let actions = buildActions();

  const normalized = normalizeEvent({
    message,
    meta: body.meta,
    intent,
    confidence,
    eventType: "lead",
  });

  const n8nPayload = {
    sessionId,
    ...normalized,
  };

  try {
    const n8nResult = await forwardToN8n(n8nPayload);
    const data = n8nResult?.data;

    if (data && typeof data === "object") {
      if (typeof data.reply === "string") reply = data.reply;
      if (typeof data.intent === "string") intent = data.intent;
      if (typeof data.confidence === "number") confidence = data.confidence;
      if (Array.isArray(data.actions) && data.actions.length > 0) actions = data.actions;
    }
  } catch (error) {
    console.warn("[chat] n8n forward failed", error?.message || error);
  }

  reply = ensureLinksInReply(reply, buyUrl, whatsappUrl);
  if (!Array.isArray(actions) || actions.length === 0) {
    actions = buildActions();
  }

  return sendJson(res, 200, {
    ok: true,
    sessionId,
    intent,
    confidence,
    reply,
    actions,
  });
};
