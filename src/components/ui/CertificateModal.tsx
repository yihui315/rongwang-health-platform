'use client';

import React, { useEffect } from 'react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** URL to the certificate image or PDF */
  src: string;
  type?: 'image' | 'pdf';
}

export default function CertificateModal({
  isOpen,
  onClose,
  title,
  src,
  type = 'image',
}: CertificateModalProps) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-auto bg-slate-50 flex items-center justify-center">
          {type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={title}
              className="max-w-full max-h-[65vh] object-contain"
            />
          ) : (
            <iframe
              src={src}
              title={title}
              className="w-full h-[65vh]"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs text-slate-400">
            {type === 'pdf' ? 'PDF 文档，可点击下载' : '点击外部链接查看原图'}
          </p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            在新窗口打开 →
          </a>
        </div>
      </div>
    </div>
  );
}
