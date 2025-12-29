const MIN_PRICES_USD = {
  "V-ITAREN": 37.5,
  "V-ORGANEX": 37.5,
  "V-ITALAY": 37.5,
  "V-ASCULAX": 37.5,
  "V-GLUTATION": 67.5,
  "V-ITADOL": 37.5,
  "V-FORTYFLORA": 37.5,
  "V-OMEGA 3": 63.0,
  VITALPRO: 63.0,
  "V-NITRO": 52.5,
  "V-NRGY": 37.5,
  "VITALAGE COLLAGEN": 75.0,
  "V-CONTROL": 37.5,
  VITALBOOST: 37.5,
  "V-CURCUMAX": 37.5,
  "V-DAILY": 75.0,
  "GLUTATION PLUS": 67.5,
  "V-NEUROKAFE": 45.0,
  "V-THERMOKAFE": 45.0,
  "V-LOVEKAFE": 45.0,
  "V-TE DETOX": 17.0,
};

const CATEGORY_DEFINITIONS = {
  energia: {
    label: "energía",
    product: "VITALPRO",
    phrase: "aporta energía funcional",
  },
  estres_descanso: {
    label: "estrés / descanso",
    product: "V-ITALAY",
    phrase: "contribuye a la relajación y descanso",
  },
  digestion: {
    label: "digestión",
    product: "V-FORTYFLORA",
    phrase: "apoya la flora intestinal",
  },
  enfoque: {
    label: "enfoque",
    product: "V-NEUROKAFE",
    phrase: "apoya el rendimiento mental",
  },
  peso: {
    label: "peso",
    product: "V-THERMOKAFE",
    phrase: "acompaña el metabolismo activo",
  },
  articulaciones: {
    label: "articulaciones",
    product: "V-ITADOL",
    phrase: "acompaña la movilidad articular",
  },
  bienestar: {
    label: "bienestar general",
    product: "V-DAILY",
    phrase: "apoya el equilibrio nutricional diario",
  },
  escaneo: {
    label: "escaneo",
  },
};

const CATEGORY_KEYWORDS = {
  energia: ["energia", "energias", "energía", "cansancio", "fatiga", "vitalidad"],
  estres_descanso: [
    "estres",
    "estrés",
    "stress",
    "ansiedad",
    "relaj",
    "descanso",
    "dormir",
    "sueno",
    "sueño",
    "insomnio",
  ],
  digestion: ["digestion", "digestión", "digest", "estomago", "estómago", "intestinal", "flora"],
  enfoque: [
    "enfoque",
    "concentr",
    "foco",
    "memoria",
    "mental",
    "atencion",
    "atención",
    "claridad",
  ],
  peso: ["peso", "metabol", "adelgazar", "bajar", "grasa", "quema", "metabolismo"],
  articulaciones: [
    "articul",
    "articulaciones",
    "movilidad",
    "dolor articular",
    "rodilla",
    "cadera",
  ],
  bienestar: ["bienestar", "general", "salud", "equilibrio", "nutricional", "diario"],
  escaneo: ["escaneo", "scan", "scanner", "qr"],
};

function normalizeInput(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectCategory(userInput) {
  const normalized = normalizeInput(userInput);
  if (!normalized) return null;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(normalizeInput(keyword)))) {
      return category;
    }
  }

  return null;
}

function formatUSD(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  return `USD ${amount.toFixed(2)}`;
}

function getMinPriceUSD(productName) {
  if (!productName) return null;
  const price = MIN_PRICES_USD[productName];
  return typeof price === "number" ? price : null;
}

function buildMenuResponse() {
  return [
    "Para orientarte mejor, dime qué se parece más a lo que buscas ahora mismo:",
    "- Energía",
    "- Estrés / descanso",
    "- Digestión",
    "- Enfoque",
    "- Peso",
    "- Articulaciones",
    "- Bienestar general",
    "- Escaneo",
  ].join("\n");
}

function buildScanResponse() {
  return [
    "El escaneo es una herramienta de orientación que ayuda a observar cómo se encuentra el cuerpo en este momento, en relación con hábitos y estilo de vida.",
    "No diagnostica ni sustituye la atención médica.",
    "Su objetivo es aportar claridad para tomar decisiones más conscientes.",
  ].join("\n");
}

function buildProductResponse({ categoryLabel, product, phrase, price }) {
  return [
    `Para rutinas de ${categoryLabel}, suele encajar bien ${product}.`,
    `Es un suplemento alimenticio que ${phrase}.`,
    `Precio de referencia desde: ${price}. (Puede variar al entrar a la tienda).`,
    "¿Cómo te gustaría continuar?",
    "- Comprar ahora",
    "- Hablar con un asesor por WhatsApp",
    "- Quiero algo más personalizado (escaneo)",
    "Este producto no es un medicamento.",
    "El consumo es responsabilidad de quien lo recomienda y de quien lo usa.",
  ].join("\n");
}

function mapCategoryToResponse(category) {
  if (!category) return null;

  if (category === "escaneo") {
    return buildScanResponse();
  }

  const categoryInfo = CATEGORY_DEFINITIONS[category];
  if (!categoryInfo) return null;

  const priceValue = getMinPriceUSD(categoryInfo.product);
  if (priceValue === null) return null;

  const price = formatUSD(priceValue);
  if (!price) return null;

  return buildProductResponse({
    categoryLabel: categoryInfo.label,
    product: categoryInfo.product,
    phrase: categoryInfo.phrase,
    price,
  });
}

function handleUserMessage(userMessage) {
  const category = detectCategory(userMessage);
  if (!category) return null;
  return mapCategoryToResponse(category);
}

module.exports = {
  normalizeInput,
  detectCategory,
  MIN_PRICES_USD,
  formatUSD,
  getMinPriceUSD,
  mapCategoryToResponse,
  buildMenuResponse,
  buildScanResponse,
  buildProductResponse,
  handleUserMessage,
};
