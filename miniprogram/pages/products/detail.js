const api = require("../../utils/api");
const pdd = require("../../utils/pdd");

Page({
  data: {
    loading: true,
    error: "",
    product: null,
  },
  onLoad(options) {
    if (!options.slug) {
      this.setData({ loading: false, error: "缺少商品参数。" });
      return;
    }

    api.getProduct(options.slug, {
      source: "miniprogram_detail",
      campaign: options.campaign || "wechat_miniprogram",
      solutionSlug: options.solutionSlug,
    })
      .then((payload) => {
        this.setData({
          loading: false,
          product: payload.product,
        });
      })
      .catch(() => {
        this.setData({
          loading: false,
          error: "暂时无法加载详情，请稍后再试。",
        });
      });
  },
  goAssessment() {
    wx.switchTab({ url: "/pages/assessment/index" });
  },
  openPdd() {
    if (!this.data.product) {
      return;
    }
    pdd.runPddAction(this.data.product.pddAction);
  },
});
