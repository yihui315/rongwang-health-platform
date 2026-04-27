import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/analytics";
import { saveAnalyticsEvent } from "@/lib/data/analytics-events";
import { isFeatureEnabled } from "@/lib/feature-flags";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid analytics event.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (isFeatureEnabled("analyticsPersistence")) {
    await saveAnalyticsEvent(parsed.data);
  }

  return NextResponse.json({ ok: true });
}
