'use client';

import { useTrackPageView } from '@/src/hooks/useFunnelTracking';
import type { FunnelEventName, FunnelEventPayload } from '@/src/lib/analytics/events';

type FunnelPageTrackerProps = {
  eventName: FunnelEventName;
  payload?: FunnelEventPayload;
};

export default function FunnelPageTracker({ eventName, payload = {} }: FunnelPageTrackerProps) {
  useTrackPageView(eventName, payload);
  return null;
}
