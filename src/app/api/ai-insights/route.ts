import { NextRequest, NextResponse } from 'next/server';
import { generateInsights } from '@/lib/ai-brain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metrics = {
      energy: Number(body?.energy ?? 70),
      sleep: Number(body?.sleep ?? 70),
      stress: Number(body?.stress ?? 50),
      immunity: Number(body?.immunity ?? 70),
    };

    const insights = await generateInsights(metrics);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Default demo insights for landing pages
  const insights = await generateInsights({
    energy: 78,
    sleep: 82,
    stress: 45,
    immunity: 85,
  });
  return NextResponse.json({ insights });
}
