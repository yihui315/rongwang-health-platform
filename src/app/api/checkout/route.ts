/**
 * Stripe Checkout API
 * POST /api/checkout
 *
 * 支持两种模式:
 * 1. 订阅模式 — plan slug → 创建 subscription checkout
 * 2. 单品模式 — product items → 创建 payment checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLAN_PRICES } from '@/lib/stripe';
import { products } from '@/data/products';

interface CheckoutItem {
  type: 'plan' | 'product';
  slug: string;
  quantity?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail } = body as {
      items: CheckoutItem[];
      customerEmail?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '购物车为空' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description?: string };
        unit_amount: number;
        recurring?: { interval: 'month' };
      };
      quantity: number;
    }> = [];

    let mode: 'subscription' | 'payment' = 'payment';
    const metadata: Record<string, string> = {};

    for (const item of items) {
      if (item.type === 'plan') {
        const plan = PLAN_PRICES[item.slug];
        if (!plan) {
          return NextResponse.json(
            { error: `未知方案: ${item.slug}` },
            { status: 400 }
          );
        }
        mode = 'subscription';
        metadata.planSlug = item.slug;
        lineItems.push({
          price_data: {
            currency: 'hkd',
            product_data: {
              name: plan.name,
              description: `荣旺健康 · ${plan.name}`,
            },
            unit_amount: plan.priceHKD * 100,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        });
      } else {
        const product = products.find((p) => p.slug === item.slug);
        if (!product) {
          return NextResponse.json(
            { error: `未知产品: ${item.slug}` },
            { status: 400 }
          );
        }
        lineItems.push({
          price_data: {
            currency: 'hkd',
            product_data: {
              name: product.name,
              description: product.tagline,
            },
            unit_amount: product.price * 100,
          },
          quantity: item.quantity || 1,
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      customer_email: customerEmail || undefined,
      metadata,
      shipping_address_collection: {
        allowed_countries: ['HK', 'CN', 'MO', 'TW', 'SG', 'MY'],
      },
      locale: 'zh',
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[Checkout Error]', err);
    const message = err instanceof Error ? err.message : '支付创建失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
