const config = require("../config");

function getBaseUrl() {
  const app = getApp();
  return (app.globalData.apiBaseUrl || config.apiBaseUrl).replace(/\/$/, "");
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getBaseUrl()}${path}`,
      method: options.method || "GET",
      data: options.data,
      header: {
        "content-type": "application/json",
        ...(options.header || {}),
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(new Error(`request_failed_${res.statusCode}`));
      },
      fail: reject,
    });
  });
}

function listProducts() {
  return request("/api/wechat/miniprogram/products");
}

function getProduct(slug, query = {}) {
  const search = Object.keys(query)
    .filter((key) => query[key])
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join("&");
  return request(`/api/wechat/miniprogram/products/${encodeURIComponent(slug)}${search ? `?${search}` : ""}`);
}

function login(code) {
  return request("/api/wechat/miniprogram/login", {
    method: "POST",
    data: { code },
  });
}

function logPddClick(action) {
  const tracking = action && action.tracking ? action.tracking : {};
  if (!tracking.productSlug) {
    return Promise.resolve();
  }

  const utm = tracking.campaign
    ? {
      source: "wechat",
      medium: "miniprogram",
      campaign: tracking.campaign,
    }
    : undefined;

  return request("/api/pdd/click", {
    method: "POST",
    data: {
      productId: tracking.productSlug,
      sessionId: tracking.sessionId,
      source: tracking.source || "miniprogram",
      solutionSlug: tracking.solutionSlug,
      utm,
      destinationUrl: buildAbsoluteUrl(action.bridgeHref),
    },
  }).catch(() => undefined);
}

function buildAbsoluteUrl(path) {
  const base = getBaseUrl();
  if (!path) {
    return base;
  }
  return path.indexOf("http") === 0 ? path : `${base}${path}`;
}

module.exports = {
  request,
  listProducts,
  getProduct,
  login,
  logPddClick,
  buildAbsoluteUrl,
};
