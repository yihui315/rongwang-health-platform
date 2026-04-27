import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { updateRecommendationRuleForAdmin } from "@/lib/data/recommendation-rules";
import { recommendationConditionSchema } from "@/schemas/recommendation-rule";

const adminRuleUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    condition: recommendationConditionSchema.optional(),
    productIds: z.array(z.string().trim().min(1)).min(1).optional(),
    priority: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
    note: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

interface AdminRuleRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: AdminRuleRouteContext) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = adminRuleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid rule update", details: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;
  const rule = await updateRecommendationRuleForAdmin(id, parsed.data);
  if (!rule) {
    return NextResponse.json({ error: "rule storage unavailable" }, { status: 503 });
  }

  return NextResponse.json({ rule });
}
