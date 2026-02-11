(function loadInfiniumEnv(globalScope) {
  const buyUrl = "https://vitalhealthglobal.com/collections/all?refID=145748";
  const whatsappPhone = "19565505115";
  const presetApiBase = typeof globalScope.INFINIUM_API_BASE_URL === "string"
    ? globalScope.INFINIUM_API_BASE_URL.trim()
    : "";

  globalScope.INFINIUM_API_BASE_URL = presetApiBase || globalScope.location.origin;
  globalScope.INFINIUM_BUY_URL = buyUrl;
  globalScope.INFINIUM_WHATSAPP_PHONE = whatsappPhone;
  globalScope.INFINIUM_WHATSAPP_URL = `https://wa.me/${whatsappPhone}`;
})(window);
