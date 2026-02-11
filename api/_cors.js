// api/_cors.js
module.exports = function setCors(req, res, methods = ["POST", "OPTIONS"]) {
  const origin = req.headers.origin;
  const envOrigins = process.env.FRONTEND_ORIGIN || "";
  const allowedOrigins = envOrigins
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

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
  res.setHeader("Access-Control-Allow-Credentials", "false");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (allowedOrigins.length > 0) {
    if (!origin || !allowedOrigins.includes(origin)) {
      res.status(403).json({ ok: false, error: "origin_forbidden" });
      return false;
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    return true;
  }

  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  return true;
};
