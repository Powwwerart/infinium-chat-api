 codex/fix-backend-not-connected-state-9865ni
const DEFAULT_ORIGIN = "https://infinium.services";
const ALLOWED_ORIGINS = new Set([
  DEFAULT_ORIGIN,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
]);

function getAllowedOrigin(requestOrigin) {
  if (process.env.CORS_ALLOW_ALL_ORIGINS === "true") {
    return "*";
  }

  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) {
    return requestOrigin;
  }

  return DEFAULT_ORIGIN;
}

function setCors(req, res, methods) {
  res.setHeader("Access-Control-Allow-Origin", getAllowedOrigin(req.headers.origin));
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
=======
const DEFAULT_ALLOWED_ORIGINS = ["https://infinium.services", "http://localhost:3000"];

function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAllowedOrigin(requestOrigin) {
  const allowedOrigins = parseAllowedOrigins();
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0];
}

function setCors(req, res, methods) {
  const requestOrigin = req?.headers?.origin;
  const allowedOrigin = getAllowedOrigin(requestOrigin);

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
 main
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = {
 codex/fix-backend-not-connected-state-9865ni
  DEFAULT_ORIGIN,
  ALLOWED_ORIGINS,
  getAllowedOrigin,
=======
  DEFAULT_ALLOWED_ORIGINS,
  getAllowedOrigin,
  parseAllowedOrigins,
 main
  setCors,
};
