const { logPddClick } = require("./api");

function runPddAction(action) {
  if (!action) {
    return;
  }

  const tracking = action.tracking || {};
  logPddClick(tracking, action.bridgeHref);

  if (action.type === "mini_program" && action.appId && action.path) {
    wx.navigateToMiniProgram({
      appId: action.appId,
      path: action.path,
    });
    return;
  }

  if (action.type === "copy_link") {
    wx.setClipboardData({
      data: action.bridgeHref,
    });
    return;
  }

  wx.navigateTo({
    url: `/pages/pdd-bridge/index?href=${encodeURIComponent(action.bridgeHref || "/product-map/")}`,
  });
}

module.exports = {
  runPddAction,
};
