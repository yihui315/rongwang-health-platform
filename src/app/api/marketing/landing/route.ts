import { NextRequest, NextResponse } from "next/server";
import { askBrain } from "@/lib/ai-brain";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { enforceMarketingAdminGuard } from "@/lib/marketing/api-guard";
import { evaluateMarketingCompliance } from "@/lib/marketing/automation";

interface Body {
  keyword: string;
  audience?: string;
  intent?: "inform" | "compare" | "transaction";
}

function fallbackLanding(body: Body) {
  const keyword = body.keyword;
  return {
    metaTitle: `${keyword} | 荣旺健康 AI 评估与调理方向`,
    metaDescription: `了解${keyword}相关的常见原因、风险提示、生活方式建议和营养支持方向。先完成 AI 健康评估，再查看适合自己的方案。`,
    hero: {
      eyebrow: "3 分钟 AI 健康评估",
      title: `${keyword}，先评估再选择方案`,
      subtitle: "根据年龄、症状、作息和目标生成健康教育建议，不做诊断，不夸大效果。",
      ctaPrimary: "立即开始 AI 评估",
      ctaSecondary: "查看健康方案",
    },
    painPoints: [
      "不知道自己的问题更偏睡眠、压力、疲劳还是营养结构",
      "看了很多商品推荐，却不知道是否适合自己",
      "担心症状背后存在需要线下就医的风险信号",
      "希望有清晰、谨慎、可追踪的健康建议路径",
    ],
    solution: {
      title: "AI-first 的健康教育路径",
      description: "荣旺健康先做风险分层和问题类型判断，再提供生活方式建议、保健品/OTC 方向和购买入口。",
      bullets: ["先评估风险等级", "再查看问题方案", "最后决定是否进入购买入口"],
    },
    benefits: [
      { icon: "AI", title: "结构化评估", description: "收集年龄、症状、持续时间、作息和目标，减少盲目选择。" },
      { icon: "EDU", title: "健康教育优先", description: "所有建议都以一般健康教育为边界，不做诊断和治疗承诺。" },
      { icon: "SAFE", title: "高风险拦截", description: "出现紧急风险信号时优先提示就医，不展示购买入口。" },
      { icon: "UTM", title: "可追踪转化", description: "活动链接带 UTM，方便复盘评估开始率、完成率和跳转率。" },
    ],
    howItWorks: [
      { step: 1, title: "开始评估", description: "用 3 分钟填写基础健康资料和目标。" },
      { step: 2, title: "查看报告", description: "获得风险等级、可能因素和生活方式建议。" },
      { step: 3, title: "选择方案", description: "在非紧急场景下查看适合的健康支持方向。" },
    ],
    faqs: [
      { q: "AI 评估能替代医生吗？", a: "不能。它只提供健康教育和一般参考，不能替代医生诊断、治疗或处方。" },
      { q: "什么情况要先就医？", a: "胸痛、呼吸困难、黑便、呕血、持续高烧、意识异常、自伤想法等应及时就医。" },
      { q: "会直接推荐商品吗？", a: "不会先推商品。AI 只判断风险和方向，商品推荐由后端规则控制。" },
      { q: "评估需要注册吗？", a: "第一版可直接开始评估，后续可选择留下联系方式以便复访。" },
      { q: "内容适合所有人吗？", a: "孕妇、儿童、老人、多病共存或正在服药者应先咨询医生或药师。" },
    ],
    finalCta: {
      title: "从一次谨慎的 AI 健康评估开始",
      subtitle: "先理解身体信号，再选择适合自己的支持方向。",
      buttonText: "立即开始 AI 评估",
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!isFeatureEnabled("marketingAutomation")) {
      return NextResponse.json({ success: false, error: "feature_disabled" }, { status: 404 });
    }

    const guard = await enforceMarketingAdminGuard(request, {
      bucket: "marketing-landing",
      eventPrefix: "api.marketing_landing",
      defaultLimit: 12,
      defaultWindowMs: 10 * 60 * 1000,
      limitEnv: "MARKETING_LANDING_RATE_LIMIT",
      windowEnv: "MARKETING_LANDING_RATE_WINDOW_MS",
    });
    if (guard) {
      return guard;
    }

    const body = (await request.json()) as Body;
    if (!body.keyword) {
      return NextResponse.json({ error: "missing_keyword" }, { status: 400 });
    }

    const prompt = `为荣旺健康生成一个中文 SEO 落地页 JSON。

关键词：${body.keyword}
目标人群：${body.audience ?? "关注日常健康管理的用户"}
搜索意图：${body.intent ?? "transaction"}

输出字段：
metaTitle, metaDescription,
hero { eyebrow, title, subtitle, ctaPrimary, ctaSecondary },
painPoints,
solution { title, description, bullets },
benefits [{ icon, title, description }],
howItWorks [{ step, title, description }],
faqs [{ q, a }],
finalCta { title, subtitle, buttonText }

要求：
1. AI 评估是主 CTA。
2. 不做疾病诊断、治疗承诺或处方建议。
3. 高风险症状必须提示就医。
4. 只输出 JSON。`;

    if (isFeatureEnabled("marketingLandingAi")) {
      const { content, success, worker } = await askBrain(prompt, {
        system: "你是 SEO 与健康合规兼顾的中文落地页文案助手。",
        temperature: 0.65,
        maxTokens: 2500,
      });

      if (success && content?.trim()) {
        try {
          const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
          const parsed = JSON.parse(cleaned);
          return NextResponse.json({
            landing: parsed,
            worker,
            source: "ai",
            compliance: evaluateMarketingCompliance(JSON.stringify(parsed)),
          });
        } catch {
          // Use deterministic fallback below.
        }
      }
    }

    const landing = fallbackLanding(body);
    return NextResponse.json({
      landing,
      source: "fallback",
      compliance: evaluateMarketingCompliance(JSON.stringify(landing)),
    });
  } catch (error) {
    console.error("landing gen error", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
