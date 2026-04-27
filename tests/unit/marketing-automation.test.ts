import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMarketingCampaignPlan,
  evaluateMarketingCompliance,
} from "@/lib/marketing/automation";

test("marketing automation plans keep AI assessment as the primary conversion path", () => {
  const plan = buildMarketingCampaignPlan({
    objective: "assessment_conversion",
    audience: "30-45 岁关注周期、睡眠和精力管理的女性",
    solution: "female-health",
    keyword: "女性健康支持方案",
    campaignSlug: "female-health-spring",
    channels: ["seo_article", "xiaohongshu", "email"],
  });

  assert.equal(plan.solutionSlug, "female-health");
  assert.equal(plan.primaryCta.href.startsWith("/ai-consult?focus=female-health"), true);
  assert.equal(plan.assets.length, 3);
  assert.equal(plan.geoFlow.tasks.length, 1);
  assert.equal(plan.geoFlow.tasks[0].payload.status, "paused");
  assert.equal(plan.compliance.approved, true);

  for (const asset of plan.assets) {
    assert.match(asset.href, /utm_campaign=female-health-spring/);
    assert.match(asset.href, /utm_source=/);
    assert.equal(asset.primaryCta.href.includes("/products"), false);
  }
});

test("marketing compliance blocks medical diagnosis and absolute effect claims", () => {
  const result = evaluateMarketingCompliance("保证治愈失眠，100%有效，没有任何副作用。");

  assert.equal(result.approved, false);
  assert.equal(result.warnings.length >= 3, true);
  assert.match(result.safeDisclaimer, /健康教育/);
});
