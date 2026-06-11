'use client';

import { useEffect } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

interface TrackSolutionPageViewClientProps {
  solutionSlug: string;
}

/** Fires once when a solution detail page mounts. */
export default function TrackSolutionPageViewClient({ solutionSlug }: TrackSolutionPageViewClientProps) {
  useEffect(() => {
    trackAnalyticsEvent({
      name: 'solution_page_viewed',
      solutionSlug,
    });
  }, [solutionSlug]);

  return null;
}