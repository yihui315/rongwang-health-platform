'use client';

import React, { useState } from 'react';
import HomeIcon from '@/components/home/HomeIcon';
import CertificateModal from '@/components/ui/CertificateModal';

export interface TrustBadgeItem {
  /** Display title */
  title: string;
  /** Short description */
  description: string;
  /** HomeIcon name */
  icon: string;
  /** Optional certificate image URL — if set, the item becomes clickable */
  certificateUrl?: string;
  /** Label shown on the certificate trigger */
  certificateLabel?: string;
  /** 'image' or 'pdf' — defaults to 'image' */
  certificateType?: 'image' | 'pdf';
}

interface TrustBadgeProps {
  items: TrustBadgeItem[];
  /** Layout: default 'grid', 'row' for horizontal layout */
  layout?: 'grid' | 'row';
}

export default function TrustBadge({ items, layout = 'grid' }: TrustBadgeProps) {
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    src: string;
    type: 'image' | 'pdf';
  }>({ open: false, title: '', src: '', type: 'image' });

  const openModal = (item: TrustBadgeItem) => {
    if (item.certificateUrl) {
      setModal({
        open: true,
        title: item.title,
        src: item.certificateUrl,
        type: item.certificateType ?? 'image',
      });
    }
  };

  const gridClass =
    layout === 'row'
      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'
      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4';

  return (
    <>
      <section className="border-y border-slate-100 bg-white py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={gridClass}>
            {items.map((item) => {
              const clickable = Boolean(item.certificateUrl);
              return (
                <div
                  key={item.title}
                  onClick={() => openModal(item)}
                  className={`flex flex-col items-center rounded-2xl border bg-white p-5 text-center shadow-sm transition ${
                    clickable
                      ? 'cursor-pointer border-amber-100 hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30'
                      : 'border-slate-100 hover:border-emerald-100 hover:shadow-md'
                  } md:flex-row md:items-start md:text-left`}
                  title={clickable ? `点击查看证书：${item.title}` : item.description}
                >
                  <span className="mb-3 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 md:mb-0 md:mr-3">
                    <HomeIcon name={item.icon as any} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                    {clickable && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        查看证书 →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CertificateModal
        isOpen={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        title={modal.title}
        src={modal.src}
        type={modal.type}
      />
    </>
  );
}
