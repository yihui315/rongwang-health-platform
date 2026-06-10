'use client';

import React, { useState } from 'react';
import HomeIcon from '@/components/home/HomeIcon';
import CertificateModal from '@/components/ui/CertificateModal';
import { homeTrustPoints } from '@/lib/home/home-content';
import type { TrustPoint } from '@/lib/home/home-content';

/**
 * 信任区 —— Hero 下方紧贴一行展示
 * 桌面 6 栏，移动 2 栏。
 * 带证书的项目点击后弹出 CertificateModal 查看原图。
 */
export default function HomeTrustBar() {
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    src: string;
    type: 'image' | 'pdf';
  }>({ open: false, title: '', src: '', type: 'image' });

  const openModal = (item: TrustPoint) => {
    if (item.certificateUrl) {
      setModal({
        open: true,
        title: item.title,
        src: item.certificateUrl,
        type: item.certificateType ?? 'image',
      });
    }
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  return (
    <>
      <section className="border-y border-slate-100 bg-white py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
            {homeTrustPoints.map((item) => {
              const clickable = Boolean(item.certificateUrl);
              return (
                <div
                  key={item.title}
                  onClick={() => openModal(item)}
                  className={`
                    flex flex-col items-center rounded-2xl border bg-white p-5 text-center shadow-sm transition
                    ${
                      clickable
                        ? 'cursor-pointer border-amber-100 hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30'
                        : 'border-slate-100 hover:border-emerald-100 hover:shadow-md'
                    }
                    md:flex-row md:items-start md:text-left
                  `}
                  title={clickable ? `点击查看证书：${item.title}` : item.description}
                >
                  <span
                    className={`mb-3 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl md:mb-0 md:mr-3 ${
                      clickable ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <HomeIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                    {clickable && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        {item.certificateLabel ?? '查看证书'} →
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
        onClose={closeModal}
        title={modal.title}
        src={modal.src}
        type={modal.type}
      />
    </>
  );
}
