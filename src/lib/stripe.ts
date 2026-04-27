/**
 * Stripe 支付集成
 * 荣旺健康 — 支持月度订阅 + 单品购买
 */

import Stripe from 'stripe';

// Server-side Stripe instance
// Build-safe: use placeholder to avoid "Neither apiKey nor config.authenticator" error
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_build_placeholder_never_use_in_production',
  {
    // @ts-expect-error — Stripe SDK version mismatch
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  }
);

// Client-side Stripe loader (lazy)
// Plan → Stripe Price mapping
export const PLAN_PRICES: Record<string, { name: string; priceHKD: number }> = {
  fatigue: { name: '抗疲劳组合 · 月度订阅', priceHKD: 299 },
  sleep:   { name: '深度睡眠组合 · 月度订阅', priceHKD: 259 },
  immune:  { name: '免疫防护组合 · 月度订阅', priceHKD: 349 },
  stress:  { name: '压力缓解组合 · 月度订阅', priceHKD: 399 },
};
