/**
 * Stripe 支付集成
 * 荣旺健康 — 支持月度订阅 + 单品购买
 */

import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // @ts-expect-error — Stripe SDK version mismatch
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Client-side Stripe loader (lazy)
let stripePromise: Promise<import('@stripe/stripe-js').Stripe | null> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const { loadStripe } = require('@stripe/stripe-js');
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
}

// Plan → Stripe Price mapping
export const PLAN_PRICES: Record<string, { name: string; priceHKD: number }> = {
  fatigue: { name: '抗疲劳组合 · 月度订阅', priceHKD: 299 },
  sleep:   { name: '深度睡眠组合 · 月度订阅', priceHKD: 259 },
  immune:  { name: '免疫防护组合 · 月度订阅', priceHKD: 349 },
  stress:  { name: '压力缓解组合 · 月度订阅', priceHKD: 399 },
};
