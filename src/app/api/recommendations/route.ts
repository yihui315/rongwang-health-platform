import { NextRequest, NextResponse } from 'next/server';
import { PlanSlug } from '@/types';
import { askBrain } from '@/lib/ai-brain';

interface RecommendationBody {
  currentPlan?: PlanSlug;
  goals?: string[];
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

const planCatalog: Record<PlanSlug, { name: string; pair: PlanSlug[] }> = {
  fatigue: { name: '抗疲劳方案', pair: ['sleep', 'stress'] },
  sleep: { name: '深度睡眠方案', pair: ['stress', 'fatigue'] },
  immune: { name: '免疫防护方案', pair: ['fatigue', 'stress'] },
  stress: { name: '压力舒缓方案', pair: ['sleep', 'immune'] },
  liver: { name: '商务护肝方案', pair: ['fatigue', 'immune'] },
  beauty: { name: '内调抗衰方案', pair: ['immune', 'sleep'] },
  cardio: { name: '心脑调理方案', pair: ['immune', 'fatigue'] },
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecommendationBody;
    const base: PlanSlug = body.currentPlan ?? 'fatigue';
    const complementary = planCatalog[base]?.pair ?? ['sleep', 'immune'];

    const recommended = [base, ...complementary].slice(0, 3);

    const prompt = `用户当前方案：${planCatalog[base].name}。请用不超过60字说明为什么搭配${complementary
      .map((s) => planCatalog[s].name)
      .join('、')}更有效，语气专业温暖。`;

    const { content, success } = await askBrain(prompt, { maxTokens: 200 });

    const reason = success && content?.trim()
      ? content.trim()
      : `${planCatalog[base].name}与${complementary
          .map((s) => planCatalog[s].name)
          .join('、')}在能量、神经、免疫系统协同作用，叠加使用可放大效果。`;

    return NextResponse.json({
      recommended,
      reason,
      catalog: recommended.map((slug) => ({ slug, name: planCatalog[slug].name })),
    });
  } catch (error) {
    console.error('recommendations error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
