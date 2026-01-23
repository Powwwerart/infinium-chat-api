// api/_cors.js
module.exports = function setCors(req, res, methods = ["POST", "OPTIONS"]) {
  const origin = req.headers.origin;
  const envOrigins = process.env.FRONTEND_ORIGIN || "";
  const isProd = process.env.NODE_ENV === "production";

  const allowedOrigins = envOrigins
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const allowAll = !allowedOrigins.length && !isProd;

  const isAllowed =
    allowAll ||
    (origin && allowedOrigins.includes(origin)) ||
    // si no hay origin (curl/postman/server-to-server), no bloquees
    !origin;

  if (isAllowed) {
    if (allowAll) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    } else if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
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
    console.warn(`CORS blocked origin=${origin || "unknown"} path=${req.url || ""}`);
    res.statusCode = 403;
    res.end("CORS blocked: origin not allowed");
    return;
  }
};
