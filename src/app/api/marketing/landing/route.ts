import { NextRequest, NextResponse } from 'next/server';
import { askBrain } from '@/lib/ai-brain';

/**
 * 一辉智能体 · SEO 落地页文案生成器
 *
 * POST /api/marketing/landing
 * body: {
 *   keyword: string       // 目标关键词，例如 "女性抗疲劳保健品"
 *   audience?: string     // 目标人群
 *   intent?: 'inform' | 'compare' | 'transaction'
 * }
 *
 * 返回结构化 landing page JSON，可直接喂给 /lp/[slug]/page.tsx 渲染。
 */

interface Body {
  keyword: string;
  audience?: string;
  intent?: 'inform' | 'compare' | 'transaction';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    if (!body.keyword) {
      return NextResponse.json({ error: 'missing keyword' }, { status: 400 });
    }

    const prompt = `为荣旺健康生成一份 SEO 落地页文案 JSON。

目标关键词: ${body.keyword}
目标人群: ${body.audience ?? '泛中产都市白领'}
搜索意图: ${body.intent ?? 'transaction'}

输出 JSON 对象，字段结构：
{
  "metaTitle": "... (55-60 字符，含关键词)",
  "metaDescription": "... (150-160 字符)",
  "hero": { "eyebrow": "", "title": "", "subtitle": "", "ctaPrimary": "", "ctaSecondary": "" },
  "painPoints": ["痛点 1", "痛点 2", "痛点 3", "痛点 4"],
  "solution": { "title": "", "description": "", "bullets": ["...", "...", "..."] },
  "benefits": [
    { "icon": "emoji", "title": "", "description": "" }
  ],
  "howItWorks": [
    { "step": 1, "title": "", "description": "" }
  ],
  "faqs": [
    { "q": "", "a": "" }
  ],
  "finalCta": { "title": "", "subtitle": "", "buttonText": "" }
}

要求：
- benefits 至少 4 条，howItWorks 3 步，faqs 5 条
- 语言：简体中文，合规，避免绝对化承诺
- 只输出 JSON，不要前后多余文字`;

    const { content, success, worker } = await askBrain(prompt, {
      system: '你是 SEO + 转化率双优化的中文落地页文案专家，输出有效 JSON。',
      temperature: 0.7,
      maxTokens: 2500,
    });

    if (success && content?.trim()) {
      const cleaned = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({ landing: parsed, worker, source: 'ai' });
      } catch {
        /* fallthrough */
      }
    }

    // Fallback stub
    return NextResponse.json({
      landing: {
        metaTitle: `${body.keyword} | 荣旺健康 AI 方案`,
        metaDescription: `${body.keyword}怎么选？荣旺健康 AI 3 分钟测评，基于真实症状为你匹配临床级保健方案。香港保税仓直邮，30 天无忧退款。`,
        hero: {
          eyebrow: '3 分钟 AI 健康测评',
          title: `${body.keyword}的科学答案`,
          subtitle: '跳过盲试，直接拿到适合你的方案',
          ctaPrimary: '开始免费测评',
          ctaSecondary: '了解方案',
        },
        painPoints: [
          '市面保健品琳琅满目，不知从何选起',
          '吃了一堆胶囊却感觉不到变化',
          '网红推荐良莠不齐，怕踩雷',
          '想长期吃，但预算有限',
        ],
        solution: {
          title: '一次 AI 测评，一份科学方案',
          description: '荣旺 AI 顾问基于 12 个维度分析你的身体信号，匹配经过临床验证的成分组合。',
          bullets: ['无广告干扰的纯科学推荐', '临床级原料 · 第三方纯度检测', '订阅制永不断货 · 可随时暂停'],
        },
        benefits: [
          { icon: '🎯', title: '精准匹配', description: '告别盲试，算法为你量身推荐' },
          { icon: '🔬', title: '临床级原料', description: 'USP / cGMP 认证，纯度可追溯' },
          { icon: '🚚', title: '香港直邮', description: '保税仓 3-5 天到家，全程可追踪' },
          { icon: '💯', title: '30 天无忧', description: '不满意全额退款，无需理由' },
        ],
        howItWorks: [
          { step: 1, title: '3 分钟测评', description: '回答 12 个关于身体状态的问题' },
          { step: 2, title: 'AI 匹配方案', description: '基于你的答案生成专属推荐' },
          { step: 3, title: '直邮到家', description: '下单后 3-5 天收到你的方案' },
        ],
        faqs: [
          { q: '多久能感受到效果？', a: '大部分用户在坚持服用 14-30 天后会感受到明显变化。' },
          { q: '可以和药物一起吃吗？', a: '如果你正在服用处方药，建议先咨询医生。' },
          { q: '订阅可以随时取消吗？', a: '可以。在 dashboard 一键暂停或取消，没有任何门槛。' },
          { q: '怎么知道是真货？', a: '所有商品来自香港保税仓，可追溯原产地与批次。' },
          { q: '不满意怎么办？', a: '30 天内无条件全额退款，联系客服即可。' },
        ],
        finalCta: {
          title: '开始你的科学健康之旅',
          subtitle: '3 分钟测评 · 免费 · 无需注册',
          buttonText: '立即开始',
        },
      },
      source: 'fallback',
    });
  } catch (e) {
    console.error('landing gen error', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
