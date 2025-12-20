const DEFAULT_ALLOWED_ORIGINS = [
  "https://infinium.services",
  "https://localhost:3000",
  "http://localhost:3000",
];

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = {
  DEFAULT_ALLOWED_ORIGINS,
  getAllowedOrigin,
  parseAllowedOrigins,
  setCors,
};
