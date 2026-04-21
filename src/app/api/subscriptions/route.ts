import { NextRequest, NextResponse } from 'next/server';
import { PlanSlug } from '@/types';
import { getSupabase } from '@/lib/supabase';

interface SubscriptionBody {
  planSlug: PlanSlug;
  tier: 'monthly' | 'quarterly' | 'yearly';
  userId?: string;
}

const tierIntervalDays: Record<SubscriptionBody['tier'], number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubscriptionBody;
    if (!body.planSlug || !body.tier) {
      return NextResponse.json({ error: 'missing planSlug or tier' }, { status: 400 });
    }

    const nextDelivery = new Date();
    nextDelivery.setDate(nextDelivery.getDate() + tierIntervalDays[body.tier]);

    const row = {
      plan_slug: body.planSlug,
      tier: body.tier,
      status: 'active' as const,
      next_delivery: nextDelivery.toISOString().slice(0, 10),
      started_at: new Date().toISOString(),
      user_id: body.userId ?? null,
    };

    try {
      await getSupabase().from('subscriptions').insert(row);
    } catch (err) {
      console.error('subscription insert failed', err);
    }

    return NextResponse.json({
      success: true,
      subscription: row,
      message: '订阅已成功开启',
    });
  } catch (error) {
    console.error('subscription error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data } = await getSupabase().from('subscriptions').select('*');
    return NextResponse.json({ subscriptions: data ?? [] });
  } catch {
    return NextResponse.json({ subscriptions: [] });
  }
}
