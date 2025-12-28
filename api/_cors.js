// api/_cors.js
module.exports = function setCors(req, res, methods = ["POST", "OPTIONS"]) {
  const origin = req.headers.origin;

  // Lee env y lo convierte a lista limpia
  const raw = process.env.ALLOWED_ORIGINS || "";
  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Permite wildcard con "*"
  const allowAll = allowed.includes("*");

  // Decide el origin permitido
  const isAllowed =
    allowAll ||
    (origin && allowed.includes(origin)) ||
    // si no hay origin (curl/postman/server-to-server), no bloquees
    !origin;

  if (isAllowed) {
    // IMPORTANTE: si es allowAll y hay origin, refleja el origin para evitar problemas con credentials/proxies
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader(
    "Access-Control-Allow-Headers",
    [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Infinium-Secret",
      "X-Infinium-Site",
      "X-Infinium-Team",
      "X-Infinium-Campaign",
    ].join(", ")
  );
  // Si NO usas cookies, déjalo en false (mejor). Si algún día usas cookies, lo activas.
  res.setHeader("Access-Control-Allow-Credentials", "false");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Si el origin NO está permitido, corta aquí con 403 para que lo veas claro en Network
  if (!isAllowed) {
    res.statusCode = 403;
    res.end("CORS blocked: origin not allowed");
    return;
  }
};
