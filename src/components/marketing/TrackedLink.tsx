'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTrackClick } from '@/src/hooks/useFunnelTracking';
import type { FunnelEventName, FunnelEventPayload } from '@/src/lib/analytics/events';

type TrackedLinkProps = {
  href: string;
  className?: string;
  eventName: FunnelEventName;
  payload?: FunnelEventPayload;
  children: ReactNode;
};

export default function TrackedLink({ href, className, eventName, payload = {}, children }: TrackedLinkProps) {
  const trackClick = useTrackClick(eventName, payload);

  return (
    <Link className={className} href={href} onClick={() => trackClick()}>
      {children}
    </Link>
  );
}
