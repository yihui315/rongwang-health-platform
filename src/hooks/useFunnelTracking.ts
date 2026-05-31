'use client';

import { useCallback, useEffect } from 'react';
import { trackFunnelEvent, type FunnelEventName, type FunnelEventPayload } from '@/src/lib/analytics/events';

export function useTrackPageView(eventName: FunnelEventName, payload: FunnelEventPayload = {}) {
  const payloadKey = JSON.stringify(payload);

  useEffect(() => {
    trackFunnelEvent(eventName, JSON.parse(payloadKey) as FunnelEventPayload);
  }, [eventName, payloadKey]);
}

export function useTrackClick(eventName: FunnelEventName, payload: FunnelEventPayload = {}) {
  const payloadKey = JSON.stringify(payload);

  return useCallback(
    (extraPayload: FunnelEventPayload = {}) => {
      trackFunnelEvent(eventName, { ...(JSON.parse(payloadKey) as FunnelEventPayload), ...extraPayload });
    },
    [eventName, payloadKey]
  );
}
