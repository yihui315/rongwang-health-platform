'use client';

import { trackAnalyticsEvent } from '@/lib/analytics';

interface TrackCTAClicksProps {
  eventName: 'solution_cta_clicked' | 'product_add_to_cart_clicked' | 'advisor_cta_clicked' | 'homepage_cta_clicked';
  solutionSlug?: string;
  productId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Invisible client component that registers a one-shot click handler on its children.
 * Import and drop inside any onclick tree without changing existing markup.
 */
export default function TrackCTAClicks({
  eventName,
  solutionSlug,
  productId,
  metadata,
}: TrackCTAClicksProps) {
  // No visual output — purely behavioural.
  return null;
}

export function fireCTAClick(
  eventName: TrackCTAClicksProps['eventName'],
  opts: { solutionSlug?: string; productId?: string; metadata?: Record<string, unknown> } = {}
) {
  trackAnalyticsEvent({
    name: eventName,
    solutionSlug: opts.solutionSlug,
    productId: opts.productId,
    metadata: opts.metadata,
  });
}