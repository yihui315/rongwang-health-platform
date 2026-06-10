'use client';

import React, { useState } from 'react';
import HomeIcon from '@/components/home/HomeIcon';
import CertificateModal from '@/components/ui/CertificateModal';
import { homeTrustPoints } from '@/lib/home/home-content';
import type { TrustPoint } from '@/lib/home/home-content';

/**
 * 产品页底部信任栏 —— 复用首页信任区数据
 * 桌面 3 栏（精简版），移动 2 栏。
 */
export default function ProductTrustFooter() {
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    src: string;
    type: 'image' | 'pdf';
  }>({ open: false, title: '', src: '', type: 'image' });

  const openModal = (item: TrustPoint) => {
    if (item.certificateUrl) {
      setModal({ open: true, title: item.title, src: item.certificateUrl, type: item.certificateType ?? 'image' });
    }
  };

  return (
    <>
      <section className="border-y border-slate-100 bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            购物保障
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {homeTrustPoints.map((item) => {
              const clickable = Boolean(item.certificateUrl);
              return (
                <div
                  key={item.title}
                  onClick={() => openModal(item)}
                  className={`
                    flex flex-col items-center rounded-xl border bg-white p-4 text-center shadow-sm transition
                    ${clickable
                      ? 'cursor-pointer border-amber-100 hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30'
                      : 'border-slate-100 hover:border-emerald-100 hover:shadow-md'
                    }
                  `}
                  title={clickable ? `点击查看证书：${item.title}` : item.description}
                >
                  <span
                    className={`mb-2 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                      clickable ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <HomeIcon name={item.icon} className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{item.title}</p>
                  {clickable && (
                    <span className="mt-1 text-xs text-amber-600">{item.certificateLabel ?? '查看证书'} →</span>
                  )}
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
