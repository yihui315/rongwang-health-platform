/**
 * 荣旺健康 — 分析埋点工具
 * GA4 + Plausible 双埋点，完整转化漏斗追踪
 */

// ─── GA4 gtag helper ───────────────────────────────
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

function plausible(event: string, props?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}

// ─── Generic tracker ───────────────────────────────
export function track(event: string, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  console.log('[analytics]', event, payload ?? {});
  gtag('event', event, payload);
  plausible(event, payload as Record<string, string | number>);
}

// ─── Page View ─────────────────────────────────────
export function trackPageView(url: string) {
  gtag('config', process.env.NEXT_PUBLIC_GA4_ID, { page_path: url });
  plausible('pageview');
}

// ─── E-Commerce Events ─────────────────────────────
export function trackAddToCart(item: { name: string; sku: string; price: number }) {
  track('add_to_cart', {
    currency: 'HKD',
    value: item.price,
    items: [{ item_id: item.sku, item_name: item.name, price: item.price }],
  });
}

export function trackBeginCheckout(value: number, items: Array<{ name: string; sku: string }>) {
  track('begin_checkout', {
    currency: 'HKD',
    value,
    items: items.map((i) => ({ item_id: i.sku, item_name: i.name })),
  });
}

export function trackPurchase(
  transactionId: string,
  value: number,
  items: Array<{ name: string; sku: string; price: number; quantity: number }>
) {
  track('purchase', {
    transaction_id: transactionId,
    currency: 'HKD',
    value,
    items: items.map((i) => ({
      item_id: i.sku,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

// ─── Quiz Events ───────────────────────────────────
export function trackQuizStart() {
  track('quiz_start');
}

export function trackQuizComplete(result: { type: string; plan: string }) {
  track('quiz_complete', { quiz_type: result.type, recommended_plan: result.plan });
}

// ─── Subscription Events ───────────────────────────
export function trackSubscribe(plan: string, value: number) {
  track('subscribe', { plan, currency: 'HKD', value });
}

// ─── Auth Events ───────────────────────────────────
export function trackSignup(method: string) {
  track('sign_up', { method });
}

export function trackLogin(method: string) {
  track('login', { method });
}
