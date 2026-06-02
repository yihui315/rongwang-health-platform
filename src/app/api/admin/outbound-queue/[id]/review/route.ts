import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import {
  recordOutboundQueueReviewDecision,
  type OutboundQueueReviewAction,
} from "@/lib/marketing/outbound-queue";

const outboundQueueReviewSchema = z
  .object({
    action: z.enum(["reviewed_blocked", "cancelled"]),
    note: z.string().trim().min(3).max(1000),
    actor: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

interface OutboundQueueReviewRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: OutboundQueueReviewRouteContext) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = outboundQueueReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid outbound queue review", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const result = await recordOutboundQueueReviewDecision({
    id,
    action: parsed.data.action as OutboundQueueReviewAction,
    note: parsed.data.note,
    actor: parsed.data.actor,
  });

  if (result.error === "status_conflict") {
    return NextResponse.json(
      {
        error: "outbound queue entry cannot be reviewed from current status",
        status: result.status,
      },
      { status: 409 },
    );
  }

  if (result.error === "not_found") {
    return NextResponse.json({ error: "outbound queue entry unavailable" }, { status: 404 });
  }

  if (result.error === "storage_unavailable") {
    return NextResponse.json({ error: "outbound queue storage unavailable" }, { status: 503 });
  }

  return NextResponse.json({ success: true, entry: result.entry });
}
