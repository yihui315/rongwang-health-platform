'use client';

import Link from 'next/link';
import { fireCTAClick } from '@/components/analytics/TrackCTAClicks';

interface TrackHomepageCTAProps {
  primaryHref: string;
  secondaryHref: string;
}

/**
 * Client wrapper for the homepage Hero CTA buttons.
 * Fires homepage_cta_clicked on every click.
 */
export default function TrackHomepageCTA({ primaryHref, secondaryHref }: TrackHomepageCTAProps) {
  return (
   <div className="mt-8 flex flex-wrap items-center gap-3">
      <Link
        href={primaryHref}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
        onClick={() => fireCTAClick('homepage_cta_clicked', { metadata: { cta: 'primary', href: primaryHref } })}
      >
        立即开始 AI 评估
        <span aria-hidden>→</span>
      </Link>
      <Link
        href={secondaryHref}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        onClick={() => fireCTAClick('homepage_cta_clicked', { metadata: { cta: 'secondary', href: secondaryHref } })}
      >
        查看健康方案
      </Link>
    </div>
  );
}