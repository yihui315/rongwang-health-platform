export type FunnelEventName =
  | 'homepage_view'
  | 'scenario_click'
  | 'solution_view'
  | 'product_recommendation_view'
  | 'product_card_view'
  | 'product_detail_click'
  | 'pdd_click'
  | 'safe_cta_click'
  | 'assessment_start'
  | 'copy_product_name'
  | 'wechat_contact_click';

export type FunnelEventPayload = Record<string, string | number | boolean | null | undefined>;

export type FunnelEvent = {
  event: FunnelEventName;
  eventName: FunnelEventName;
  payload: FunnelEventPayload;
  scenarioSlug?: string | number | boolean | null;
  productId?: string | number | boolean | null;
  ctaId?: string | number | boolean | null;
  currentUrl: string;
  url: string;
  referrer: string;
  utm: Record<string, string>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  timestamp: string;
  device: 'mobile' | 'desktop' | 'unknown';
  userAgent: string;
};

export function readCurrentUtm(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    if (key.startsWith('utm_')) {
      utm[key] = value;
    }
  }

  return utm;
}

export function createBrowserFunnelEvent(eventName: FunnelEventName, payload: FunnelEventPayload = {}): FunnelEvent | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const userAgent = window.navigator?.userAgent ?? '';
  const utm = readCurrentUtm(window.location.search);

  return {
    event: eventName,
    eventName,
    payload,
    scenarioSlug: payload.scenarioSlug ?? payload.scenario_slug,
    productId: payload.productId ?? payload.product_id,
    ctaId: payload.ctaId ?? payload.cta_id,
    currentUrl: window.location.href,
    url: window.location.href,
    referrer: document.referrer,
    utm,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    timestamp: new Date().toISOString(),
    device: detectDevice(userAgent),
    userAgent,
  };
}

function detectDevice(userAgent: string): 'mobile' | 'desktop' | 'unknown' {
  if (!userAgent) return 'unknown';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) ? 'mobile' : 'desktop';
}

export function trackFunnelEvent(eventName: FunnelEventName, payload: FunnelEventPayload = {}): void {
  const event = createBrowserFunnelEvent(eventName, payload);
  if (!event) return;

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[rongwang:funnel]', event);
  }

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ ...event });
  }
}
