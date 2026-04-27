import { NextResponse } from "next/server";
import { askBrain } from "@/lib/ai-brain";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { getProductBySlug } from "@/lib/data/products";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { getAiConsultHrefForValue } from "@/lib/health/consult-entry";
import { checkRateLimit } from "@/lib/health/rate-limit";
import { evaluateMarketingCompliance } from "@/lib/marketing/automation";
import { logApiEvent, logApiWarning } from "@/lib/observability";

type Channel = "xiaohongshu" | "wechat" | "blog" | "douyin" | "weibo";

interface Body {
  channel: Channel;
  topic?: string;
  productSlug?: string;
  solution?: string;
  count?: number;
}

const channelSpec: Record<Channel, { name: string; lengthHint: string; style: string }> = {
  xiaohongshu: {
    name: "小红书",
    lengthHint: "标题 18-24 字，正文 300-500 字，5-8 个标签",
    style: "真实生活场景、轻科普、先自测再行动",
  },
  wechat: {
    name: "微信公众号",
    lengthHint: "标题 22-30 字，正文 800-1200 字，结构化小标题",
    style: "专业、温和、证据导向，避免夸大承诺",
  },
  blog: {
    name: "SEO 博客",
    lengthHint: "标题 55-60 字符，正文 1200 字以上，H2/H3 结构",
    style: "搜索意图优先，健康教育优先，CTA 指向 AI 评估",
  },
  douyin: {
    name: "抖音口播",
    lengthHint: "60 秒脚本，前 3 秒强钩子，每 10 秒一个转折",
    style: "短句、口语化、有风险提示，不做诊断",
  },
  weibo: {
    name: "微博",
    lengthHint: "140 字以内，带话题标签",
    style: "观点明确、适合转发，轻 CTA",
  },
};

function stringifyIngredient(value: unknown) {
  if (value && typeof value === "object") {
    const item = value as { name?: unknown; dose?: unknown };
    return [item.name, item.dose].filter(Boolean).join(" ");
  }
  return String(value ?? "");
}

function parseJsonArray(text: string) {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed : null;
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function readPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildFallbackItems(input: {
  body: Body;
  count: number;
  topic: string;
  ctaHref: string;
}) {
  return Array.from({ length: input.count }, (_, index) => ({
    title: `${input.topic}: 先评估，再选择适合自己的支持方向 ${index + 1}`,
    body:
      "很多健康困扰并不适合直接照搬清单。建议先用 3 分钟 AI 评估梳理年龄、症状、作息和目标，再查看对应的生活方式建议、营养支持方向和购买入口。本内容仅供健康教育参考，症状严重或持续时请咨询医生或药师。",
    hashtags: input.body.channel === "xiaohongshu"
      ? ["#AI健康评估", "#健康管理", "#营养支持", "#荣旺健康"]
      : ["#AI健康评估", "#健康科普"],
    ctaText: "立即开始 AI 评估",
    ctaHref: input.ctaHref,
  }));
}

export async function POST(request: Request) {
  try {
    if (!isAdminRequestAuthorized(request)) {
      logApiWarning("api.marketing_content.unauthorized", {
        ip: getClientIp(request),
      });
      return NextResponse.json({ success: false, error: "admin_required" }, { status: 401 });
    }

    const rate = await checkRateLimit(
      `marketing-content:${getClientIp(request)}`,
      readPositiveInt(process.env.MARKETING_CONTENT_RATE_LIMIT, 12),
      readPositiveInt(process.env.MARKETING_CONTENT_RATE_WINDOW_MS, 10 * 60 * 1000),
    );

    if (!rate.allowed) {
      logApiWarning("api.marketing_content.rate_limited", {
        ip: getClientIp(request),
        resetAt: rate.resetAt,
      });
      return NextResponse.json(
        { success: false, error: "rate_limited" },
        {
          status: 429,
          headers: {
            "x-ratelimit-remaining": String(rate.remaining),
            "x-ratelimit-reset": String(rate.resetAt),
          },
        },
      );
    }

    const body = (await request.json()) as Body;
    const spec = channelSpec[body.channel];
    if (!spec) {
      return NextResponse.json({ error: "invalid_channel" }, { status: 400 });
    }

    const count = Math.min(Math.max(body.count ?? 1, 1), 5);
    const product = body.productSlug ? await getProductBySlug(body.productSlug) : undefined;
    const topic = body.topic ?? "AI 健康评估";
    const ctaHref = getAiConsultHrefForValue(body.solution ?? product?.plans?.[0]);
    const productBrief = product
      ? [
          `产品参考：${product.name}，${product.brand}`,
          `定位：${product.tagline}`,
          `核心成分：${product.keyIngredients.map(stringifyIngredient).join("、")}`,
          "注意：只能作为方向参考，不能承诺疗效。",
        ].join("\n")
      : "不指定单品，优先引导用户完成 AI 评估。";

    const prompt = `你是荣旺健康的合规营销内容助手。请生成 ${count} 条 ${spec.name} 内容。
主题：${topic}
渠道规格：${spec.lengthHint}
风格：${spec.style}
统一 CTA：${ctaHref}
${productBrief}

硬性要求：
1. 只做健康教育，不做疾病诊断、治疗承诺或处方建议。
2. 先引导 AI 评估，再查看方案，不要直接强推购买。
3. 输出 JSON 数组，每项字段为 title, body, hashtags, ctaText, ctaHref。
4. 只输出 JSON，不要输出 markdown 代码块之外的解释。`;

    if (isFeatureEnabled("marketingContentAi")) {
      const { content, success, worker } = await askBrain(prompt, {
        system: "你是谨慎、合规、懂中文渠道语境的健康营销文案助手。",
        temperature: 0.75,
        maxTokens: 2000,
      });

      if (success && content?.trim()) {
        try {
          const parsed = parseJsonArray(content);
          if (parsed) {
            return NextResponse.json({
              channel: body.channel,
              count: parsed.length,
              items: parsed,
              worker,
              source: "ai",
              compliance: evaluateMarketingCompliance(JSON.stringify(parsed)),
            });
          }
        } catch {
          // Fall through to deterministic fallback.
        }
      }
    }

    const items = buildFallbackItems({ body, count, topic, ctaHref });

    logApiEvent("api.marketing_content.generated", {
      channel: body.channel,
      source: isFeatureEnabled("marketingContentAi") ? "ai_or_fallback" : "fallback",
      count: items.length,
    });

    return NextResponse.json({
      channel: body.channel,
      count: items.length,
      items,
      source: "fallback",
      compliance: evaluateMarketingCompliance(JSON.stringify(items)),
    });
  } catch (error) {
    console.error("[marketing-content] generation failed", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
