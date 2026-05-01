Page({
  copyAssessmentLink() {
    const app = getApp();
    wx.setClipboardData({
      data: app.globalData.aiConsultUrl,
      success() {
        wx.showToast({ title: "已复制入口", icon: "success" });
      },
    });
  },
  openBridge() {
    wx.navigateTo({
      url: "/pages/pdd-bridge/index?href=%2Fai-consult",
    });
  },
});
