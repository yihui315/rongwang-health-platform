import { NextResponse } from "next/server";
import { z } from "zod";
import { savePddClick } from "@/lib/data/pdd-clicks";
import { checkRateLimit } from "@/lib/health/rate-limit";
import { normalizeSolutionSlug } from "@/lib/health/solutions";

const schema = z.object({
  url: z.string().min(1),
  plan: z.string().optional(),
  ch: z.string().optional(), // utm channel
  sessionId: z.string().optional(),
  consultationId: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const raw = {
    url: searchParams.get("url") ?? "",
    plan: searchParams.get("plan") ?? undefined,
    ch: searchParams.get("ch") ?? undefined,
    sessionId: searchParams.get("sessionId") ?? undefined,
    consultationId: searchParams.get("consultationId") ?? undefined,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success || !parsed.data.url) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  // Rate limit: 60 redirects per minute per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = await checkRateLimit(`pdd-redirect:${ip}`, 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.redirect(parsed.data.url, 302);
  }

  // Decode destination URL
  let destinationUrl: string;
  try {
    destinationUrl = decodeURIComponent(parsed.data.url);
  } catch {
    destinationUrl = parsed.data.url;
  }

  // Save click to DB for attribution
  try {
    await savePddClick({
      productId: parsed.data.plan ?? "unknown",
      sessionId: parsed.data.sessionId ?? undefined,
      consultationId: parsed.data.consultationId ?? undefined,
      source: `affiliate_${parsed.data.ch ?? "direct"}`,
      solutionSlug: parsed.data.plan
        ? (normalizeSolutionSlug(parsed.data.plan) ?? undefined)
        : undefined,
      ref: "affiliate",
      utm: parsed.data.ch
        ? { source: parsed.data.ch, medium: "affiliate", campaign: parsed.data.plan ?? undefined }
        : undefined,
      destinationUrl,
    });
  } catch (err) {
    console.error("pdd-redirect savePddClick failed:", err);
  }

  // Redirect to destination
  return NextResponse.redirect(destinationUrl, 302);
}
