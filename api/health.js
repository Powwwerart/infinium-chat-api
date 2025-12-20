module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    service: "infinium-chat-api",
    ts: new Date().toISOString(),
  });
};
