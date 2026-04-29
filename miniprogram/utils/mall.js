const api = require("./api");
const config = require("../config");

function buildAbsoluteMallHref(href) {
  if (href) {
    return api.buildAbsoluteUrl(href);
  }

  const app = getApp();
  return app.globalData.siteMallUrl || config.siteMallUrl || api.buildAbsoluteUrl("/products");
}

function runMallAction(action) {
  const href = action && action.href ? action.href : "/products";
  wx.navigateTo({
    url: `/pages/mall-bridge/index?href=${encodeURIComponent(href)}`,
  });
}

function copyMallHref(href) {
  wx.setClipboardData({
    data: buildAbsoluteMallHref(href),
    success() {
      wx.showToast({ title: "已复制官网商城", icon: "success" });
    },
  });
}

module.exports = {
  buildAbsoluteMallHref,
  copyMallHref,
  runMallAction,
};
