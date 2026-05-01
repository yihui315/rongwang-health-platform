const api = require("./api");
const config = require("../config");

function runPddAction(action) {
  if (!action) {
    wx.showToast({ title: "购买入口暂未配置", icon: "none" });
    return;
  }

  api.logPddClick(action);

  if (action.type === "mini_program" && action.appId && action.path) {
    wx.navigateToMiniProgram({
      appId: action.appId,
      path: action.path,
      fail() {
        openBridge(action);
      },
    });
    return;
  }

  if (action.type === "copy_link") {
    const text = buildAbsoluteBridge(action.bridgeHref);
    wx.setClipboardData({
      data: text,
      success() {
        wx.showModal({
          title: "已复制购买入口",
          content: "请在微信或浏览器中打开该入口，完成评估后再决定是否购买。",
          showCancel: false,
        });
      },
    });
    return;
  }

  openBridge(action);
}

function buildAbsoluteBridge(path) {
  const app = getApp();
  const base = (app.globalData.apiBaseUrl || config.apiBaseUrl).replace(/\/$/, "");
  if (!path) {
    return base;
  }
  return path.indexOf("http") === 0 ? path : `${base}${path}`;
}

function openBridge(action) {
  wx.navigateTo({
    url: `/pages/pdd-bridge/index?href=${encodeURIComponent(action.bridgeHref || "/product-map/unknown")}`,
  });
}

module.exports = {
  runPddAction,
  buildAbsoluteBridge,
};
