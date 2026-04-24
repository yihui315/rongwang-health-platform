'use client';

import { useState } from 'react';

interface ShareReferralProps {
  productName: string;
  productSlug: string;
  referralCode?: string;
}

export default function ShareReferral({ productName, productSlug, referralCode = 'RW2026' }: ShareReferralProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://rongwang.health/products/${productSlug}?ref=${referralCode}`;
  const shareText = `推荐你试试${productName}，我一直在用，效果很好！`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareChannels = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: '微信',
      href: '#',
      color: 'bg-green-600 hover:bg-green-700',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z" />
        </svg>
      ),
      onClick: () => handleCopy(),
    },
  ];

  return (
    <div className="border border-slate-100 rounded-xl p-5 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900">推荐好友，双方各得 ¥50 优惠券</h4>
          <p className="mt-1 text-xs text-slate-500">分享你的专属链接，好友下单成功后双方均可获得优惠</p>

          {/* 分享链接 */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 truncate">
              {shareUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                copied
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>

          {/* 分享到 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">分享到:</span>
            {shareChannels.map((ch) => (
              <a
                key={ch.name}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={ch.onClick ? (e) => { e.preventDefault(); ch.onClick(); } : undefined}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors ${ch.color}`}
                title={ch.name}
              >
                {ch.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
