'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  brandShort: string;
  brandColor: string;
  brandDesc?: string;
  badge?: string;
  badgeStyle?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  brandShort,
  brandColor,
  brandDesc,
  badge,
  badgeStyle,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-100 aspect-square max-h-[480px]">
        {/* Brand + Badge overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`rounded-full ${brandColor} px-3 py-1.5 text-[12px] font-bold text-white shadow-lg`}>
              {brandShort}
            </span>
            {brandDesc && (
              <span className="rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-1 text-white/80 text-[11px]">
                {brandDesc}
              </span>
            )}
          </div>
          {badge && badgeStyle && (
            <span className={`rounded-full px-3 py-1.5 text-[12px] font-bold shadow-lg ${badgeStyle}`}>
              {badge}
            </span>
          )}
        </div>

        <Image
          src={images[activeIndex]}
          alt={`${productName} - 图片 ${activeIndex + 1}`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={activeIndex === 0}
        />

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 z-10 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-white text-[12px] font-medium">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="上一张"
            >
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="下一张"
            >
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-teal-500 shadow-md ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Image
                src={src}
                alt={`${productName} 缩略图 ${i + 1}`}
                fill
                className="object-contain p-1 bg-white"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
