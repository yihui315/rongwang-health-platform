import { z } from "zod";

export const analyticsEventNames = [
  "assessment_started",
  "assessment_completed",
  "recommendation_clicked",
  "pdd_redirect_clicked",
  "tool_completed",
  "marketing_campaign_planned",
  "marketing_asset_generated",
  "marketing_geoflow_task_created",
  "marketing_autopilot_run",
] as const;

export const analyticsEventSchema = z.object({
  name: z.enum(analyticsEventNames),
  sessionId: z.string().optional(),
  consultationId: z.string().optional(),
  source: z.string().optional(),
  solutionSlug: z.string().optional(),
  productId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

export function createAnalyticsEvent(event: AnalyticsEvent): AnalyticsEvent {
  return analyticsEventSchema.parse(event);
}

export function trackAnalyticsEvent(event: AnalyticsEvent) {
  const parsed = analyticsEventSchema.safeParse(event);
  if (!parsed.success || typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify(parsed.data);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never block the user path.
  });
}
