// Initialize Vercel Speed Insights for API monitoring
// This module should be imported at the top of each API route to ensure
// Speed Insights tracking is enabled for performance metrics collection

const { injectSpeedInsights } = require("@vercel/speed-insights");

// Initialize Speed Insights injection
// This should only be called once per execution, but Node.js module caching
// ensures this is safe to call from multiple routes
function initializeSpeedInsights() {
  try {
    injectSpeedInsights();
  } catch (error) {
    // Silently fail if Speed Insights initialization fails
    // This ensures the API continues to function even if Speed Insights has issues
    console.debug("Speed Insights initialization:", error.message);
  }
}

module.exports = {
  initializeSpeedInsights,
};
