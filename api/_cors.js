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
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = {
  DEFAULT_ORIGIN,
  ALLOWED_ORIGINS,
  getAllowedOrigin,
  setCors,
};
