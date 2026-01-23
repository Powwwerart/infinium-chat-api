// api/_cors.js
module.exports = function setCors(req, res, methods = ["POST", "OPTIONS"]) {
  const origin = req.headers.origin;
  const envOrigins = process.env.FRONTEND_ORIGIN || "";
  const allowedOrigins = envOrigins
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  let allowOrigin = "";
  if (allowedOrigins.length > 0) {
    if (origin && allowedOrigins.includes(origin)) {
      allowOrigin = origin;
    } else {
      allowOrigin = allowedOrigins[0];
    }
  } else {
    allowOrigin = origin || "*";
  }

  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
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
};
