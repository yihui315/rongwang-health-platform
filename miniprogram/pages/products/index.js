const api = require("../../utils/api");

Page({
  data: {
    loading: true,
    error: "",
    products: [],
  },
  onLoad() {
    this.loadProducts();
  },
  loadProducts() {
    api.listProducts()
      .then((payload) => {
        this.setData({
          loading: false,
          products: payload.products || [],
        });
      })
      .catch(() => {
        this.setData({
          loading: false,
          error: "暂时无法加载方案，请稍后再试。",
        });
      });
  },
  goAssessment() {
    wx.switchTab({ url: "/pages/assessment/index" });
  },
  openDetail(event) {
    const slug = event.currentTarget.dataset.slug;
    wx.navigateTo({ url: `/pages/products/detail?slug=${slug}` });
  },
});
