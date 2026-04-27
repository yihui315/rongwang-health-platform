import { NextResponse } from "next/server";
import { z } from "zod";
import { savePddClick } from "@/lib/data/pdd-clicks";
import { checkRateLimit } from "@/lib/health/rate-limit";
import { normalizeSolutionSlug } from "@/lib/health/solutions";

const clickPayloadSchema = z.object({
  productId: z.string().min(1),
  sessionId: z.string().optional(),
  consultationId: z.string().optional(),
  source: z.string().optional(),
  solutionSlug: z.string().optional(),
  ref: z.string().optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
  destinationUrl: z.string().url().optional(),
});

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`product-map:${ip}`, 30, 10 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "点击过于频繁，请稍后再试。" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON。" }, { status: 400 });
  }

  const parsed = clickPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "点击日志参数无效。" }, { status: 400 });
  }

  const solutionSlug = normalizeSolutionSlug(parsed.data.solutionSlug) ?? undefined;

  await savePddClick({
    productId: parsed.data.productId,
    sessionId: parsed.data.sessionId,
    consultationId: parsed.data.consultationId,
    source: parsed.data.source ?? "product-map",
    solutionSlug,
    ref: parsed.data.ref,
    utm: parsed.data.utm,
    destinationUrl: parsed.data.destinationUrl,
  });

  return NextResponse.json({ ok: true });
}
