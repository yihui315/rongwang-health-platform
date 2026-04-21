import { NextRequest, NextResponse } from 'next/server';
import { emailSequences, sequenceList } from '@/data/email-sequences';
import { askBrain } from '@/lib/ai-brain';

/**
 * GET  /api/marketing/email           → list all sequences
 * GET  /api/marketing/email?slug=xxx  → get single sequence
 * POST /api/marketing/email           → generate a NEW custom email via AI
 */

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (slug) {
    const seq = emailSequences[slug];
    if (!seq) {
      return NextResponse.json({ error: 'sequence not found' }, { status: 404 });
    }
    return NextResponse.json(seq);
  }
  return NextResponse.json({
    sequences: sequenceList.map((s) => ({
      slug: s.slug,
      name: s.name,
      trigger: s.trigger,
      steps: s.templates.length,
      benchmark: s.benchmark,
    })),
  });
}

interface GenerateBody {
  audience: string;         // 目标人群描述
  scenario: string;         // 场景/触发
  tone?: 'warm' | 'urgent' | 'scientific' | 'playful';
  productName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateBody;

    const prompt = `你是荣旺健康的营销文案 AI。请为以下场景生成一封中文营销邮件：

目标人群: ${body.audience}
触发场景: ${body.scenario}
推广产品: ${body.productName ?? '未指定（通用）'}
语气: ${body.tone ?? 'warm'}

要求：
1. 输出 JSON 对象，字段：subject, preview, heading, body, ctaText, ctaHref
2. subject 不超过 35 字，包含 emoji 可选
3. preview 为收件箱预览文字，不超过 40 字
4. body 为 markdown 纯文本，150-250 字
5. 调性科学、温暖、不夸张承诺
6. 不要在 body 中出现任何 <html> 标签

只输出 JSON，不要前后多余文字。`;

    const { content, success } = await askBrain(prompt, {
      system: '你是专业跨境保健品品牌营销文案，输出有效的 JSON。',
      temperature: 0.7,
      maxTokens: 800,
    });

    if (success && content?.trim()) {
      // Try to parse JSON (strip markdown fences if present)
      const cleaned = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({ email: parsed, source: 'ai' });
      } catch {
        // Fall through to fallback
      }
    }

    // Heuristic fallback
    return NextResponse.json({
      email: {
        subject: `为你准备了一份${body.productName ?? '健康'}方案 🌿`,
        preview: '基于你的状态精选',
        heading: `专属于 ${body.audience} 的建议`,
        body: `我们注意到 ${body.scenario}。这份方案针对你的情况挑选了临床级成分，30 天为一个周期，坚持可感知明显改善。\n\n如果有任何疑问，直接回复这封邮件即可。`,
        ctaText: '查看方案',
        ctaHref: '/quiz',
      },
      source: 'fallback',
    });
  } catch (e) {
    console.error('marketing email gen error', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
