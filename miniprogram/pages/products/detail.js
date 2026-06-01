const { getProduct } = require("../../utils/api");
const { runMallAction } = require("../../utils/mall");
const { runPddAction } = require("../../utils/pdd");

Page({
  data: {
    product: null,
    siteMallAction: null,
    pddAction: null,
  },

  onLoad(query) {
    if (!query.slug) {
      return;
    }

    getProduct(query.slug, (response) => {
      const product = response.data && response.data.product;
      this.setData({
        product,
        siteMallAction: product && product.siteMallAction,
        pddAction: product && product.pddAction,
      });
    });
  },

  openSiteMall() {
    runMallAction(this.data.siteMallAction);
  },

  openPddBridge() {
    runPddAction(this.data.pddAction);
  },
});
