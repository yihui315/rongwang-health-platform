import test from "node:test";
import assert from "node:assert/strict";
import { buildMarketingCampaignPlan } from "@/lib/marketing/automation";

test("wechat marketing assets include an assessment-first official account draft", () => {
  const plan = buildMarketingCampaignPlan({
    objective: "assessment_conversion",
    audience: "sleep and fatigue users",
    solution: "sleep",
    keyword: "sleep support",
    campaignSlug: "sleep-wechat",
    channels: ["wechat"],
  });

  const wechatAsset = plan.assets.find((asset) => asset.channel === "wechat");

  assert.ok(wechatAsset?.wechatArticle);
  assert.equal(wechatAsset.wechatArticle.kind, "official_account_article");
  assert.equal(wechatAsset.wechatArticle.title.length <= 32, true);
  assert.equal(wechatAsset.wechatArticle.digest.length <= 128, true);
  assert.match(wechatAsset.wechatArticle.primaryCtaHref, /^\/ai-consult\?focus=sleep/);
  assert.match(wechatAsset.wechatArticle.markdown, /\/ai-consult\?focus=sleep/);
  assert.doesNotMatch(wechatAsset.wechatArticle.markdown, /\/products|\/checkout|\/product-map/);
  assert.match(wechatAsset.wechatArticle.markdown, /健康教育/);
});
