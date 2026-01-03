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
    products: [
      {
        name: "VITALPRO",
        phrase: "aporta energía funcional",
        howItWorks: "combina nutrientes que ayudan a sostener el ritmo diario",
      },
      {
        name: "V-NRGY",
        phrase: "acompaña la vitalidad diaria",
        howItWorks: "incluye extractos que favorecen la sensación de empuje",
      },
    ],
  },
  estres_descanso: {
    label: "estrés / descanso",
    products: [
      {
        name: "V-ITALAY",
        phrase: "contribuye a la relajación y descanso",
        howItWorks: "aporta ingredientes que ayudan a soltar la tensión del día",
      },
      {
        name: "V-LOVEKAFE",
        phrase: "favorece una pausa tranquila",
        howItWorks: "mezcla botánicos que invitan a un momento de calma",
      },
    ],
  },
  digestion: {
    label: "digestión",
    products: [
      {
        name: "V-FORTYFLORA",
        phrase: "apoya la flora intestinal",
        howItWorks: "incluye cepas que ayudan al equilibrio digestivo",
      },
      {
        name: "V-ORGANEX",
        phrase: "acompaña la digestión ligera",
        howItWorks: "aporta fibras y nutrientes para una sensación de bienestar",
      },
    ],
  },
  enfoque: {
    label: "enfoque",
    products: [
      {
        name: "V-NEUROKAFE",
        phrase: "apoya el rendimiento mental",
        howItWorks: "combina café funcional y nutrientes para la claridad",
      },
      {
        name: "V-OMEGA 3",
        phrase: "acompaña la concentración diaria",
        howItWorks: "aporta ácidos grasos que favorecen la función cognitiva",
      },
    ],
  },
  peso: {
    label: "peso",
    products: [
      {
        name: "V-THERMOKAFE",
        phrase: "acompaña el metabolismo activo",
        howItWorks: "incluye extractos que apoyan la energía del día",
      },
      {
        name: "V-CONTROL",
        phrase: "apoya el control de antojos",
        howItWorks: "aporta fibras que ayudan a la sensación de saciedad",
      },
    ],
  },
  articulaciones: {
    label: "articulaciones",
    products: [
      {
        name: "V-ITADOL",
        phrase: "acompaña la movilidad articular",
        howItWorks: "aporta compuestos que ayudan al confort en movimiento",
      },
      {
        name: "V-CURCUMAX",
        phrase: "apoya el bienestar articular",
        howItWorks: "combina cúrcuma y nutrientes para la flexibilidad diaria",
      },
    ],
  },
  bienestar: {
    label: "bienestar general",
    products: [
      {
        name: "V-DAILY",
        phrase: "apoya el equilibrio nutricional diario",
        howItWorks: "aporta vitaminas y minerales para cubrir lo esencial",
      },
      {
        name: "VITALBOOST",
        phrase: "acompaña la vitalidad general",
        howItWorks: "combina micronutrientes para mantenerte activo",
      },
    ],
  },
  antioxidantes: {
    label: "protección antioxidante",
    products: [
      {
        name: "V-GLUTATION",
        phrase: "apoya la defensa antioxidante",
        howItWorks: "aporta antioxidantes que ayudan a neutralizar el desgaste",
      },
      {
        name: "GLUTATION PLUS",
        phrase: "refuerza el balance antioxidante",
        howItWorks: "combina nutrientes que acompañan el cuidado celular diario",
      },
    ],
  },
  piel_colageno: {
    label: "piel y colágeno",
    products: [
      {
        name: "VITALAGE COLLAGEN",
        phrase: "apoya la elasticidad de la piel",
        howItWorks: "aporta colágeno y cofactores para la nutrición dérmica",
      },
      {
        name: "V-OMEGA 3",
        phrase: "acompaña la hidratación natural",
        howItWorks: "incluye grasas buenas que favorecen una piel luminosa",
      },
    ],
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
  antioxidantes: ["antioxidante", "antioxidantes", "oxidacion", "desgaste", "proteccion"],
  piel_colageno: ["piel", "colageno", "colágeno", "elasticidad", "hidratacion"],
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
    "- Protección antioxidante",
    "- Piel y colágeno",
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

function buildProductResponse({ categoryLabel, products }) {
  return [
    `Para rutinas de ${categoryLabel}, suelen encajar bien estas opciones:`,
    `1) ${products[0].name}: ${products[0].phrase}.`,
    `Cómo funciona: ${products[0].howItWorks}.`,
    `Precio de referencia desde: ${products[0].price}. (Puede variar al entrar a la tienda).`,
    `2) ${products[1].name}: ${products[1].phrase}.`,
    `Cómo funciona: ${products[1].howItWorks}.`,
    `Precio de referencia desde: ${products[1].price}. (Puede variar al entrar a la tienda).`,
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

  if (!Array.isArray(categoryInfo.products) || categoryInfo.products.length < 2) {
    return null;
  }

  const products = categoryInfo.products.slice(0, 2).map((product) => {
    const priceValue = getMinPriceUSD(product.name);
    if (priceValue === null) return null;
    const price = formatUSD(priceValue);
    if (!price) return null;

    return {
      ...product,
      price,
    };
  });

  if (products.some((product) => !product)) return null;

  return buildProductResponse({
    categoryLabel: categoryInfo.label,
    products,
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
