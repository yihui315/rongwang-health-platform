import { NextRequest, NextResponse } from 'next/server';
import { askBrain } from '@/lib/ai-brain';
import { getProductBySlug } from '@/data/products';

/**
 * 一辉智能体 · 营销内容批量生成器
 *
 * POST /api/marketing/content
 * body: {
 *   channel: 'xiaohongshu' | 'wechat' | 'blog' | 'douyin' | 'weibo',
 *   topic?: string,
 *   productSlug?: string,
 *   count?: number      // 批量生成条数，默认 1
 * }
 */

type Channel = 'xiaohongshu' | 'wechat' | 'blog' | 'douyin' | 'weibo';

interface Body {
  channel: Channel;
  topic?: string;
  productSlug?: string;
  count?: number;
}

const channelSpec: Record<Channel, { name: string; lengthHint: string; style: string }> = {
  xiaohongshu: {
    name: '小红书',
    lengthHint: '标题 ≤ 20 字带 emoji · 正文 300-500 字 · 5-10 个 hashtag',
    style: '真实闺蜜分享体，第一人称，带具体场景和前后对比，结尾引导收藏',
  },
  wechat: {
    name: '微信公众号',
    lengthHint: '标题 ≤ 25 字悬念或数字 · 正文 800-1200 字带小标题',
    style: '科普 + 案例 + 结论三段式，专业温暖，段落短',
  },
  blog: {
    name: '博客 SEO 长文',
    lengthHint: '标题 55-60 字符 · 正文 1500+ 字 · H2/H3 结构',
    style: '信息密度高，引用研究数据，适合 Google / 百度 SEO',
  },
  douyin: {
    name: '抖音口播稿',
    lengthHint: '60 秒脚本 · 前 3 秒强钩子 · 每 10 秒一个转折',
    style: '口语化，短句密集，避免长定语',
  },
  weibo: {
    name: '微博',
    lengthHint: '≤ 140 字 · 带话题标签',
    style: '观点明确，易转发，不说教',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const spec = channelSpec[body.channel];
    if (!spec) {
      return NextResponse.json({ error: 'invalid channel' }, { status: 400 });
    }

    const count = Math.min(Math.max(body.count ?? 1, 1), 5);
    const product = body.productSlug ? getProductBySlug(body.productSlug) : null;

    const productBrief = product
      ? `\n推广产品：${product.name}（${product.brand}）
产品定位：${product.tagline}
核心成分：${product.keyIngredients.map((i) => `${i.name} ${i.dose}`).join('、')}
科学依据：${product.scientificBasis}`
      : '';

    const prompt = `你是荣旺健康的社媒内容 AI。请生成 ${count} 条${spec.name}文案。

主题：${body.topic ?? '健康保健日常'}
渠道规格：${spec.lengthHint}
调性：${spec.style}${productBrief}

硬性要求：
1. 严禁绝对化承诺（"治愈""100%有效""唯一"等）
2. 提到成分必须符合跨境保健品合规
3. 输出 JSON 数组，每条对象字段：title, body, hashtags (数组), cta
4. 只输出 JSON 数组，不要前后多余文字`;

    const { content, success, worker } = await askBrain(prompt, {
      system: '你是合规、科学、转化导向的中文保健品内容专家。输出有效 JSON。',
      temperature: 0.85,
      maxTokens: 2000,
    });

    if (success && content?.trim()) {
      const cleaned = content
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/, '')
        .trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return NextResponse.json({
            channel: body.channel,
            count: parsed.length,
            items: parsed,
            worker,
            source: 'ai',
          });
        }
      } catch {
        /* fallthrough */
      }
    }

    // Deterministic template fallback
    const items = Array.from({ length: count }, (_, i) => ({
      title: `${body.topic ?? '健康日常'} · 分享 ${i + 1}`,
      body: product
        ? `最近在用 ${product.name}，${product.tagline}。核心成分是${
            product.keyIngredients[0]?.name ?? '天然草本'
          }，坚持 30 天感觉${body.topic ?? '状态'}更稳定。`
        : `${body.topic ?? '保持健康'}的秘诀其实很简单：规律作息、营养均衡、适度运动。荣旺 AI 测验可以帮你找到最适合的方案。`,
      hashtags:
        body.channel === 'xiaohongshu'
          ? ['#保健品', '#健康生活', '#抗疲劳', '#日常分享']
          : ['#健康'],
      cta: '点击主页查看 AI 测验',
    }));

    return NextResponse.json({
      channel: body.channel,
      count: items.length,
      items,
      source: 'fallback',
    });
  } catch (e) {
    console.error('content gen error', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
