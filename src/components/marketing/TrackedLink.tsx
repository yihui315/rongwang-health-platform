'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { useTrackClick } from '@/src/hooks/useFunnelTracking';
import type { FunnelEventName, FunnelEventPayload } from '@/src/lib/analytics/events';

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'onClick'> & {
  href: string;
  eventName: FunnelEventName;
  payload?: FunnelEventPayload;
  children: ReactNode;
};

export default function TrackedLink({ href, eventName, payload = {}, children, ...props }: TrackedLinkProps) {
  const trackClick = useTrackClick(eventName, payload);

  return (
    <Link {...props} href={href} onClick={() => trackClick()}>
      {children}
    </Link>
  );
}
