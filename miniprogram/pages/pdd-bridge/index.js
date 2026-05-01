const pdd = require("../../utils/pdd");

Page({
  data: {
    href: "/ai-consult",
  },
  onLoad(options) {
    if (options.href) {
      this.setData({ href: decodeURIComponent(options.href) });
    }
  },
  copyLink() {
    wx.setClipboardData({
      data: pdd.buildAbsoluteBridge(this.data.href),
      success() {
        wx.showToast({ title: "已复制入口", icon: "success" });
      },
    });
  },
  backHome() {
    wx.switchTab({ url: "/pages/index/index" });
  },
});
