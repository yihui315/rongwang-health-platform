import { NextRequest, NextResponse } from "next/server";
import { askBrain } from "@/lib/ai-brain";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { enforceMarketingAdminGuard } from "@/lib/marketing/api-guard";
import { evaluateMarketingCompliance } from "@/lib/marketing/automation";

const cleanSequences = [
  {
    slug: "assessment_followup",
    name: "AI 评估完成后跟进",
    trigger: "用户完成 AI 健康评估但未点击推荐",
    goal: "引导用户阅读方案页并完成第一次推荐点击",
    benchmark: { openRate: "35-45%", clickRate: "6-10%" },
    templates: [
      {
        step: 1,
        delayHours: 1,
        subject: "你的 AI 健康评估报告已准备好",
        preview: "先看风险等级，再看适合你的调理方向",
        heading: "先理解身体信号，再决定下一步",
        body: "你刚完成的评估会帮助我们从症状、作息、年龄和目标中梳理更适合的健康支持方向。建议先阅读报告里的生活方式建议，再查看方案页。",
        cta: { text: "查看 AI 评估建议", href: "/ai-consult" },
        tag: "assessment_followup_day0",
      },
    ],
  },
  {
    slug: "education_nurture",
    name: "健康教育养成序列",
    trigger: "用户进入 assessment / solutions 内容页",
    goal: "提升复访和 AI 评估开始率",
    benchmark: { openRate: "30-40%", clickRate: "5-8%" },
    templates: [
      {
        step: 1,
        delayHours: 24,
        subject: "别急着买，先把问题类型分清楚",
        preview: "睡眠、疲劳、免疫和女性健康支持的判断方式",
        heading: "为什么荣旺建议先做 AI 评估？",
        body: "同样是疲劳，可能来自睡眠债、压力、饮食结构或恢复不足。先做评估，才能把建议从商品清单变成更清晰的健康教育路径。",
        cta: { text: "开始 3 分钟 AI 评估", href: "/ai-consult" },
        tag: "education_day1_assessment",
      },
    ],
  },
];

interface GenerateBody {
  audience: string;
  scenario: string;
  tone?: "warm" | "urgent" | "scientific" | "playful";
  productName?: string;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (slug) {
    const sequence = cleanSequences.find((item) => item.slug === slug);
    if (!sequence) {
      return NextResponse.json({ error: "sequence_not_found" }, { status: 404 });
    }
    return NextResponse.json(sequence);
  }

  return NextResponse.json({
    sequences: cleanSequences.map((sequence) => ({
      slug: sequence.slug,
      name: sequence.name,
      trigger: sequence.trigger,
      steps: sequence.templates.length,
      benchmark: sequence.benchmark,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isFeatureEnabled("marketingAutomation")) {
      return NextResponse.json({ success: false, error: "feature_disabled" }, { status: 404 });
    }

    const guard = await enforceMarketingAdminGuard(request, {
      bucket: "marketing-email",
      eventPrefix: "api.marketing_email",
      defaultLimit: 12,
      defaultWindowMs: 10 * 60 * 1000,
      limitEnv: "MARKETING_EMAIL_RATE_LIMIT",
      windowEnv: "MARKETING_EMAIL_RATE_WINDOW_MS",
    });
    if (guard) {
      return guard;
    }

    const body = (await request.json()) as GenerateBody;
    if (!body.audience || !body.scenario) {
      return NextResponse.json({ error: "missing_audience_or_scenario" }, { status: 400 });
    }

    const prompt = `你是荣旺健康的合规邮件营销助手。请为以下场景生成一封中文邮件。

目标人群：${body.audience}
触发场景：${body.scenario}
产品参考：${body.productName ?? "不指定单品，优先引导 AI 评估"}
语气：${body.tone ?? "warm"}

要求：
1. 输出 JSON 对象，字段：subject, preview, heading, body, ctaText, ctaHref。
2. subject 不超过 35 字，preview 不超过 45 字。
3. body 为纯文本或 markdown，150-250 字。
4. 不做诊断、不承诺治疗效果、不替代医生建议。
5. CTA 优先指向 /ai-consult。
只输出 JSON。`;

    if (isFeatureEnabled("marketingEmailAi")) {
      const { content, success } = await askBrain(prompt, {
        system: "你是谨慎、合规、以 AI 评估为主链路的健康邮件营销助手。",
        temperature: 0.65,
        maxTokens: 900,
      });

      if (success && content?.trim()) {
        try {
          const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
          const parsed = JSON.parse(cleaned);
          return NextResponse.json({
            email: parsed,
            source: "ai",
            compliance: evaluateMarketingCompliance(JSON.stringify(parsed)),
          });
        } catch {
          // Use fallback below.
        }
      }
    }

    const fallback = {
      subject: "先完成 AI 评估，再看适合你的方案",
      preview: "根据你的症状和目标，查看更稳妥的健康建议",
      heading: `给 ${body.audience} 的健康支持建议`,
      body: `我们注意到你处在“${body.scenario}”这个阶段。建议先完成 3 分钟 AI 健康评估，系统会根据年龄、症状、作息和目标生成风险等级、生活方式建议和营养支持方向。内容仅供健康教育参考；如果症状严重、持续或正在服药，请先咨询医生或药师。`,
      ctaText: "立即开始 AI 评估",
      ctaHref: "/ai-consult",
    };

    return NextResponse.json({
      email: fallback,
      source: "fallback",
      compliance: evaluateMarketingCompliance(JSON.stringify(fallback)),
    });
  } catch (error) {
    console.error("marketing email gen error", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
