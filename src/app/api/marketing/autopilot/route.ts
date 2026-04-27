import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { saveAnalyticsEvent } from "@/lib/data/analytics-events";
import { getFeatureFlagSnapshot, isFeatureEnabled } from "@/lib/feature-flags";
import { enforceMarketingAdminGuard } from "@/lib/marketing/api-guard";
import { createMarketingAutopilotRun } from "@/lib/marketing/autopilot";
import { getGeoFlowAutomationStatus } from "@/lib/marketing/geoflow";
import { growthPlaybookIds } from "@/lib/marketing/playbooks";
import {
  marketingAutopilotRequestSchema,
  marketingChannelValues,
  marketingObjectiveValues,
} from "@/schemas/marketing";

export async function GET() {
  const flags = getFeatureFlagSnapshot();

  return NextResponse.json({
    success: true,
    capabilities: {
      geoDeepIntegration: true,
      aiFirstCampaignPlanning: true,
      funnelSignalPlanning: true,
      pddAttributionPlanning: true,
      growthPlaybooks: true,
      defaultMode: "dry_run",
      executeRequiresAdmin: true,
      executeRequiresEnv: "MARKETING_AUTOPILOT_EXECUTE=true",
      objectives: marketingObjectiveValues,
      channels: marketingChannelValues,
      playbooks: growthPlaybookIds,
    },
    flags,
    geoFlow: getGeoFlowAutomationStatus(),
  });
}

export async function POST(request: Request) {
  if (!isFeatureEnabled("marketingAutomation") || !isFeatureEnabled("marketingAutopilot")) {
    return NextResponse.json({ success: false, error: "feature_disabled" }, { status: 404 });
  }

  const guard = await enforceMarketingAdminGuard(request, {
    bucket: "marketing-autopilot",
    eventPrefix: "api.marketing_autopilot",
    defaultLimit: 12,
    defaultWindowMs: 10 * 60 * 1000,
    limitEnv: "MARKETING_AUTOPILOT_RATE_LIMIT",
    windowEnv: "MARKETING_AUTOPILOT_RATE_WINDOW_MS",
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

  const parsed = marketingAutopilotRequestSchema.safeParse(body);
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

  const executeRequested = parsed.data.execute === true;
  if (executeRequested && !isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "admin_required" }, { status: 401 });
  }

  const run = await createMarketingAutopilotRun(parsed.data, {
    executeRequested,
    adminAuthorized: isAdminRequestAuthorized(request),
  });

  await saveAnalyticsEvent({
    name: "marketing_autopilot_run",
    source: "marketing-autopilot",
    solutionSlug: run.focusSolution ?? undefined,
    metadata: {
      runId: run.runId,
      status: run.status,
      mode: run.mode,
      actionCount: run.actions.length,
      experimentCount: run.experiments.length,
      geoFlowTaskDraftCount: run.geoFlow.taskDraftCount,
    },
  });

  return NextResponse.json({
    success: true,
    mode: run.mode,
    run,
  });
}
