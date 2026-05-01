"use client";

import { useState } from "react";
import Image from "next/image";

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
      <div className="relative aspect-square max-h-[480px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-white">
        <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`rounded-full ${brandColor} px-3 py-1.5 text-xs font-bold text-white shadow-sm`}>
              {brandShort}
            </span>
            {brandDesc ? (
              <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-white/90 backdrop-blur-sm">
                {brandDesc}
              </span>
            ) : null}
          </div>
          {badge && badgeStyle ? (
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${badgeStyle}`}>
              {badge}
            </span>
          ) : null}
        </div>

        <Image
          src={images[activeIndex]}
          alt={`${productName} 图片 ${activeIndex + 1}`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={activeIndex === 0}
        />

        <div className="absolute bottom-4 right-4 z-10 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {activeIndex + 1} / {images.length}
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index === 0 ? images.length - 1 : index - 1))}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
              aria-label="上一张"
            >
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index === images.length - 1 ? 0 : index + 1))}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
              aria-label="下一张"
            >
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border ${
                index === activeIndex
                  ? "border-[var(--teal)] ring-2 ring-[var(--ring-focus)]"
                  : "border-[var(--border-subtle)] hover:border-[var(--border)]"
              }`}
            >
              <Image
                src={src}
                alt={`${productName} 缩略图 ${index + 1}`}
                fill
                className="bg-white object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
