const DEFAULT_ORIGIN = "https://infinium.services";

function getAllowedOrigin() {
  return process.env.CORS_ALLOW_ALL_ORIGINS === "true" ? "*" : DEFAULT_ORIGIN;
}

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", getAllowedOrigin());
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = {
  DEFAULT_ORIGIN,
  getAllowedOrigin,
  setCors,
};
