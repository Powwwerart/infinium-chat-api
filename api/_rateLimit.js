const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const buckets = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const bucket = buckets.get(key) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  buckets.set(key, recent);
  return recent.length > MAX_REQUESTS;
}

module.exports = {
  isRateLimited,
};
