'use client';

import React from 'react';
import { getPurchaseLink } from '@/data/pinduoduo-links';
import type { PlanSlug } from '@/types';

interface PurchaseButtonProps {
  /** Plan slug for link lookup */
  slug: PlanSlug;
  /** Optional override link */
  href?: string;
  /** Display text */
  text?: string;
  className?: string;
  /** Open in new tab */
  newTab?: boolean;
}

export default function PurchaseButton({
  slug,
  href,
  text = '去拼多多购买',
  className = '',
  newTab = true,
}: PurchaseButtonProps) {
  const link = href || getPurchaseLink(slug);
  const isPlaceholder = link.includes('PLACEHOLDER');

  if (isPlaceholder) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-3 text-sm font-medium text-slate-400 cursor-not-allowed ${className}`}
        title="链接待配置"
      >
        <span>🔗</span>
        {text}（待上线）
      </span>
    );
  }

  return (
    <a
      href={link}
      target={newTab ? '_blank' : '_self'}
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg bg-orange text-white px-6 py-3 font-semibold hover:bg-orange/90 active:scale-95 transition-all shadow-sm hover:shadow-md ${className}`}
    >
      {/* Pinduoduo icon */}
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-4.5H8.5l3-7.5h1v5h2l-2 7zm3.5 0h-1v-4.5h1v4.5zm3 0h-1.5v-6H16l2-1.5v7.5H19v-4.5h1.5v4.5z" />
      </svg>
      {text}
      <span className="text-xs opacity-75">→</span>
    </a>
  );
}
