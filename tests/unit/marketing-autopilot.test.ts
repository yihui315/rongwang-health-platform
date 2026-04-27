import test from "node:test";
import assert from "node:assert/strict";
import type { AnalyticsSummary } from "@/lib/data/analytics-events";
import type { PddClickSummary } from "@/lib/data/pdd-clicks";
import { buildMarketingAutopilotRun } from "@/lib/marketing/autopilot";
import type { GeoFlowAutomationStatus } from "@/lib/marketing/geoflow";

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

function geoFlowStatus(input: Partial<GeoFlowAutomationStatus> = {}): GeoFlowAutomationStatus {
  return {
    configured: false,
    canPublish: false,
    autoPublishEnabled: false,
    requiredDefaults: {
      titleLibraryId: null,
      promptId: null,
      aiModelId: null,
    },
    ...input,
  };
}

test("marketing autopilot creates GEOFlow setup actions before publishing", () => {
  const run = buildMarketingAutopilotRun({
    request: {
      objective: "seo_growth",
      audience: "关注女性健康、睡眠和精力管理的内容用户",
      solution: "female-health",
      keyword: "女性健康支持方案",
    },
    analytics: analyticsSummary(),
    pddClicks: pddSummary(),
    geoFlow: geoFlowStatus(),
    executeRequested: false,
    adminAuthorized: false,
  });

  assert.equal(run.status, "needs_setup");
  assert.equal(run.mode, "dry_run");
  assert.equal(run.focusSolution, "female-health");
  assert.equal(run.campaigns[0].primaryCta.href.startsWith("/ai-consult?focus=female-health"), true);
  assert.equal(run.geoFlow.actions.some((action) => action.kind === "configure_geoflow"), true);
  assert.equal(run.execution.allowed, false);
  assert.equal(run.playbooks.some((entry) => entry.playbook.id === "aeo_geo_cluster"), true);
  assert.equal(run.freeToolIdeas.some((idea) => idea.href === "/tools/female-health-check"), true);
});

test("marketing autopilot prioritizes funnel fixes from weak conversion signals", () => {
  const run = buildMarketingAutopilotRun({
    request: {
      objective: "assessment_conversion",
      audience: "已经访问方案页但还没有完成评估的用户",
      solution: "sleep",
      keyword: "睡眠支持方案",
    },
    analytics: analyticsSummary({
      total: 125,
      byName: {
        assessment_started: 100,
        assessment_completed: 18,
        recommendation_clicked: 2,
        pdd_redirect_clicked: 0,
        tool_completed: 0,
        marketing_campaign_planned: 2,
        marketing_asset_generated: 0,
        marketing_geoflow_task_created: 0,
        marketing_autopilot_run: 1,
      },
      completionRate: 0.18,
      recommendationClickRate: 0.1111,
      pddRedirectRate: 0,
      toolToAssessmentRate: 0,
    }),
    pddClicks: pddSummary({ total: 0 }),
    geoFlow: geoFlowStatus({
      configured: true,
      canPublish: true,
      autoPublishEnabled: false,
      requiredDefaults: {
        titleLibraryId: 1,
        promptId: 2,
        aiModelId: 3,
      },
    }),
    executeRequested: false,
    adminAuthorized: false,
  });

  assert.equal(run.status, "ready");
  assert.equal(run.actions.some((action) => action.kind === "improve_assessment_completion"), true);
  assert.equal(run.actions.some((action) => action.kind === "improve_recommendation_click"), true);
  assert.equal(run.experiments.length >= 2, true);
  assert.equal(run.campaigns[0].assets.every((asset) => asset.primaryCta.href.includes("/ai-consult")), true);
  assert.equal(run.playbooks.some((entry) => entry.playbook.id === "cro_experiment"), true);
  assert.equal(run.lifecycleFlows.some((flow) => flow.trigger === "assessment_started_not_completed"), true);
});

test("marketing autopilot recommends improving free-tool to assessment handoff", () => {
  const run = buildMarketingAutopilotRun({
    request: {
      objective: "assessment_conversion",
      audience: "users who completed free tools but did not start AI assessment",
      solution: "sleep",
      keyword: "sleep score to AI assessment handoff",
    },
    analytics: analyticsSummary({
      total: 44,
      byName: {
        assessment_started: 4,
        assessment_completed: 1,
        recommendation_clicked: 0,
        pdd_redirect_clicked: 0,
        tool_completed: 40,
        marketing_campaign_planned: 0,
        marketing_asset_generated: 0,
        marketing_geoflow_task_created: 0,
        marketing_autopilot_run: 0,
      },
      completionRate: 0.25,
      recommendationClickRate: 0,
      pddRedirectRate: 0,
      toolToAssessmentRate: 0.1,
    }),
    pddClicks: pddSummary(),
    geoFlow: geoFlowStatus({
      configured: true,
      canPublish: true,
      autoPublishEnabled: false,
      requiredDefaults: {
        titleLibraryId: 1,
        promptId: 2,
        aiModelId: 3,
      },
    }),
    executeRequested: false,
    adminAuthorized: false,
  });

  assert.equal(run.signals.analytics.toolCompleted, 40);
  assert.equal(run.signals.analytics.toolToAssessmentRate, 0.1);
  assert.equal(run.actions.some((action) => action.kind === "improve_tool_to_assessment"), true);
  assert.equal(run.experiments.some((experiment) => experiment.id === "free-tool-handoff"), true);
});

test("marketing autopilot refuses execute mode unless the production gate is enabled", () => {
  const previous = process.env.MARKETING_AUTOPILOT_EXECUTE;
  process.env.MARKETING_AUTOPILOT_EXECUTE = "false";

  const run = buildMarketingAutopilotRun({
    request: {
      objective: "pdd_conversion",
      audience: "已经完成评估但还没有点击推荐的用户",
      solution: "liver",
      keyword: "肝脏支持方案",
      execute: true,
    },
    analytics: analyticsSummary({ completionRate: 0.8, recommendationClickRate: 0.1 }),
    pddClicks: pddSummary(),
    geoFlow: geoFlowStatus({
      configured: true,
      canPublish: true,
      autoPublishEnabled: true,
      requiredDefaults: {
        titleLibraryId: 1,
        promptId: 2,
        aiModelId: 3,
      },
    }),
    executeRequested: true,
    adminAuthorized: true,
  });

  assert.equal(run.mode, "dry_run");
  assert.equal(run.execution.allowed, false);
  assert.match(run.execution.reason, /MARKETING_AUTOPILOT_EXECUTE/);

  process.env.MARKETING_AUTOPILOT_EXECUTE = previous;
});
