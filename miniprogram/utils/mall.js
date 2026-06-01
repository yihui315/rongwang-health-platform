const config = require("../config");

function buildAbsoluteMallHref(action) {
  if (!action || !action.href) {
    return config.siteMallUrl;
  }

  if (/^https?:\/\//.test(action.href)) {
    return action.href;
  }

  return `${config.apiBaseUrl}${action.href}`;
}

function runMallAction(action) {
  const href = buildAbsoluteMallHref(action);
  wx.navigateTo({
    url: `/pages/mall-bridge/index?href=${encodeURIComponent(href)}`,
  });
}

module.exports = {
  buildAbsoluteMallHref,
  runMallAction,
};
