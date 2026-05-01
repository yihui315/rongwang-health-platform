import test from "node:test";
import assert from "node:assert/strict";
import type { AnalyticsSummary } from "@/lib/data/analytics-events";
import type { PddClickSummary } from "@/lib/data/pdd-clicks";
import {
  getGrowthPlaybooks,
  selectGrowthPlaybooks,
} from "@/lib/marketing/playbooks";

function analyticsSummary(input: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    total: 0,
    byName: {
      assessment_started: 0,
      assessment_completed: 0,
      recommendation_clicked: 0,
      pdd_redirect_clicked: 0,
      tool_completed: 0,
      marketing_campaign_planned: 0,
      marketing_asset_generated: 0,
      marketing_geoflow_task_created: 0,
      marketing_autopilot_run: 0,
      miniprogram_product_viewed: 0,
      miniprogram_pdd_clicked: 0,
      wechat_article_published: 0,
      wechat_article_cta_clicked: 0,
    },
    bySource: [],
    completionRate: 0,
    recommendationClickRate: 0,
    pddRedirectRate: 0,
    toolToAssessmentRate: 0,
    recent: [],
    ...input,
  };
}

function pddSummary(input: Partial<PddClickSummary> = {}): PddClickSummary {
  return {
    total: 0,
    bySource: [],
    bySolution: [],
    recent: [],
    ...input,
  };
}

test("growth playbooks translate founder marketing methods into Rongwang-safe workflows", () => {
  const playbooks = getGrowthPlaybooks();
  const ids = playbooks.map((playbook) => playbook.id);

  assert.deepEqual(ids, [
    "aeo_geo_cluster",
    "free_tool",
    "lifecycle_email",
    "social_listening",
    "cro_experiment",
    "launch_directory",
    "content_distribution",
    "referral_affiliate",
  ]);

  for (const playbook of playbooks) {
    assert.equal(playbook.defaultMode, "draft");
    assert.equal(playbook.primaryCta.href.startsWith("/ai-consult"), true);
    assert.equal(playbook.guardrails.includes("assessment_first"), true);
    assert.equal(playbook.guardrails.includes("medical_compliance"), true);
    assert.equal(playbook.guardrails.includes("no_auto_external_publish"), true);
  }
});

test("growth playbook selector prioritizes traffic creation when no funnel data exists", () => {
  const selected = selectGrowthPlaybooks({
    solution: "female-health",
    analytics: analyticsSummary(),
    pddClicks: pddSummary(),
    geoFlowConfigured: false,
  });
  const ids = selected.map((entry) => entry.playbook.id);

  assert.equal(ids.includes("aeo_geo_cluster"), true);
  assert.equal(ids.includes("free_tool"), true);
  assert.equal(ids.includes("launch_directory"), true);
  assert.equal(selected[0].playbook.primaryCta.href, "/ai-consult?focus=female-health");
  assert.equal(selected.some((entry) => entry.reason.includes("GEOFlow")), true);
});

test("growth playbook selector maps weak funnel stages to lifecycle and CRO plays", () => {
  const selected = selectGrowthPlaybooks({
    solution: "sleep",
    analytics: analyticsSummary({
      total: 120,
      byName: {
        assessment_started: 100,
        assessment_completed: 20,
        recommendation_clicked: 2,
        pdd_redirect_clicked: 0,
        tool_completed: 0,
        marketing_campaign_planned: 0,
        marketing_asset_generated: 0,
        marketing_geoflow_task_created: 0,
        marketing_autopilot_run: 0,
        miniprogram_product_viewed: 0,
        miniprogram_pdd_clicked: 0,
        wechat_article_published: 0,
        wechat_article_cta_clicked: 0,
      },
      completionRate: 0.2,
      recommendationClickRate: 0.1,
      pddRedirectRate: 0,
      toolToAssessmentRate: 0,
    }),
    pddClicks: pddSummary(),
    geoFlowConfigured: true,
  });
  const ids = selected.map((entry) => entry.playbook.id);

  assert.equal(ids.includes("cro_experiment"), true);
  assert.equal(ids.includes("lifecycle_email"), true);
  assert.equal(ids.includes("content_distribution"), true);
  assert.equal(selected.every((entry) => entry.assets.every((asset) => asset.status === "draft")), true);
});
