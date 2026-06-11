'use client';

import { useEffect } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

interface TrackProductPageViewClientProps {
  productId: string;
  productName: string;
}

/** Fires once when a product detail page mounts. */
export default function TrackProductPageViewClient({ productId, productName }: TrackProductPageViewClientProps) {
  useEffect(() => {
    trackAnalyticsEvent({
      name: 'product_page_viewed',
      productId,
      metadata: { productName },
    });
  }, [productId, productName]);

  return null;
}