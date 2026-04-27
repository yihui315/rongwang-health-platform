import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { saveAnalyticsEvent } from "@/lib/data/analytics-events";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { enforceMarketingAdminGuard } from "@/lib/marketing/api-guard";
import { buildMarketingCampaignPlan } from "@/lib/marketing/automation";
import {
  getGeoFlowAutomationStatus,
  publishGeoFlowTaskDraft,
} from "@/lib/marketing/geoflow";
import {
  marketingCampaignRequestSchema,
  marketingChannelValues,
  marketingObjectiveValues,
} from "@/schemas/marketing";

export async function GET() {
  return NextResponse.json({
    success: true,
    capabilities: {
      assessmentFirst: true,
      ruleBasedProductRecommendations: true,
      channels: marketingChannelValues,
      objectives: marketingObjectiveValues,
      geoFlowTaskDrafts: true,
      autoPublishRequiresAdmin: true,
    },
    geoFlow: getGeoFlowAutomationStatus(),
  });
}

export async function POST(request: Request) {
  if (!isFeatureEnabled("marketingAutomation")) {
    return NextResponse.json({ success: false, error: "feature_disabled" }, { status: 404 });
  }

  const guard = await enforceMarketingAdminGuard(request, {
    bucket: "marketing-automation",
    eventPrefix: "api.marketing_automation",
    defaultLimit: 12,
    defaultWindowMs: 10 * 60 * 1000,
    limitEnv: "MARKETING_AUTOMATION_RATE_LIMIT",
    windowEnv: "MARKETING_AUTOMATION_RATE_WINDOW_MS",
  });
  if (guard) {
    return guard;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = marketingCampaignRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "validation_failed",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const plan = buildMarketingCampaignPlan(parsed.data);
  const execute = parsed.data.execute === true;
  if (execute && !isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "admin_required" }, { status: 401 });
  }

  const mode = execute ? "publish" : "dry_run";
  const geoFlowResults = execute
    ? await Promise.all(plan.geoFlow.tasks.map((task) => publishGeoFlowTaskDraft(task)))
    : [];

  await saveAnalyticsEvent({
    name: "marketing_campaign_planned",
    source: "marketing-automation",
    solutionSlug: plan.solutionSlug ?? undefined,
    metadata: {
      campaignSlug: plan.campaignSlug,
      objective: plan.objective,
      channels: plan.assets.map((asset) => asset.channel),
      mode,
      geoFlowTasks: plan.geoFlow.tasks.length,
    },
  });

  return NextResponse.json({
    success: true,
    mode,
    plan,
    geoFlowResults,
  });
}
