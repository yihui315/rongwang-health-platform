import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { saveConsultationRecord } from "@/lib/data/consultations";
import { createHealthConsultation } from "@/lib/health/consult";
import { checkRateLimit } from "@/lib/health/rate-limit";
import { consultationResponseSchema } from "@/schemas/consultation-response";
import { consultationRequestSchema } from "@/schemas/health";

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`ai-consult:${ip}`, 8, 10 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试。" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON。" }, { status: 400 });
  }

  const parsed = consultationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "输入校验失败。",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const consultationId = randomUUID();
  const { profile } = parsed.data;
  const consultation = await createHealthConsultation(profile);
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const userAgent = request.headers.get("user-agent") || "";

  await saveConsultationRecord({
    id: consultationId,
    profile,
    result: consultation.result,
    safety: consultation.safety,
    recommendations: consultation.recommendations,
    source: "ai-consult",
    ipHash,
    userAgent,
    aiLog: consultation.aiLog,
  });

  const responsePayload = consultationResponseSchema.parse({
    consultationId,
    generatedAt: new Date().toISOString(),
    profile,
    result: consultation.result,
    recommendations: consultation.recommendations,
    safety: consultation.safety,
    ai: consultation.aiLog
      ? {
          provider: consultation.aiLog.provider,
          model: consultation.aiLog.model,
          promptVersion: consultation.aiLog.promptVersion,
          status: consultation.aiLog.status,
          fallbackUsed: consultation.aiLog.fallbackUsed,
        }
      : null,
  });

  return NextResponse.json(responsePayload);
}
