const mall = require("../../utils/mall");

Page({
  data: {
    href: "/products",
  },
  onLoad(options) {
    if (options.href) {
      this.setData({ href: decodeURIComponent(options.href) });
    }
  },
  copyLink() {
    mall.copyMallHref(this.data.href);
  },
  backProducts() {
    wx.switchTab({ url: "/pages/products/index" });
  },
});
