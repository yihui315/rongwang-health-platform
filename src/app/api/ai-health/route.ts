import { NextResponse } from 'next/server';
import { checkBrainHealth } from '@/lib/ai-brain';

export async function GET() {
  const health = await checkBrainHealth();
  return NextResponse.json(health);
}
