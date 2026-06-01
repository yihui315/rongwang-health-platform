const config = require("../config");

function request(path, options = {}) {
  return wx.request({
    url: `${config.apiBaseUrl}${path}`,
    method: options.method || "GET",
    data: options.data || {},
    header: {
      "content-type": "application/json",
      ...(options.header || {}),
    },
    success: options.success,
    fail: options.fail,
  });
}

function listProducts(success) {
  return request("/api/wechat/miniprogram/products", { success });
}

function getProduct(slug, success) {
  return request(`/api/wechat/miniprogram/products/${encodeURIComponent(slug)}`, { success });
}

function loginWithCode(code, profile, success) {
  return request("/api/wechat/miniprogram/login", {
    method: "POST",
    data: { code, profile },
    success,
  });
}

function logPddClick(tracking, destinationUrl) {
  return request("/api/pdd/click", {
    method: "POST",
    data: {
      productId: tracking.productSlug,
      source: tracking.source,
      campaign: tracking.campaign,
      solutionSlug: tracking.solutionSlug,
      sessionId: tracking.sessionId,
      destinationUrl,
    },
  });
}

module.exports = {
  request,
  listProducts,
  getProduct,
  loginWithCode,
  logPddClick,
};
