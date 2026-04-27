'use client';

import { useState } from 'react';

interface Coupon {
  code: string;
  description: string;
  discount: string;
  minOrder?: number;
  expiry: string;
}

const activeCoupons: Coupon[] = [
  {
    code: 'NEW10',
    description: '新客首单专享',
    discount: '9折',
    expiry: '2026-12-31',
  },
  {
    code: 'SUMMER50',
    description: '满 ¥500 减 ¥50',
    discount: '¥50',
    minOrder: 500,
    expiry: '2026-08-31',
  },
  {
    code: 'VIP20',
    description: '会员专属 8 折',
    discount: '8折',
    expiry: '2026-12-31',
  },
];

export default function CouponBanner() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const input = document.createElement('input');
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="bg-gradient-to-r from-rose-50 via-amber-50 to-teal-50 border-y border-amber-100/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* 顶部折叠栏 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-amber-800"
        >
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          {isExpanded ? '收起优惠券' : `领取优惠券 (${activeCoupons.length} 张可用)`}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 展开的优惠券列表 */}
        {isExpanded && (
          <div className="pb-6 grid gap-3 md:grid-cols-3 animate-in slide-in-from-top-2 duration-200">
            {activeCoupons.map((coupon) => (
              <div
                key={coupon.code}
                className="relative bg-white rounded-xl border border-dashed border-amber-200 p-4 flex items-center gap-4 overflow-hidden"
              >
                {/* 左侧折扣 */}
                <div className="flex-shrink-0 text-center">
                  <div className="text-2xl font-black text-rose-500">{coupon.discount}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {coupon.minOrder ? `满¥${coupon.minOrder}` : '无门槛'}
                  </div>
                </div>

                {/* 中间描述 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{coupon.description}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">有效期至 {coupon.expiry}</p>
                </div>

                {/* 领取按钮 */}
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    copiedCode === coupon.code
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {copiedCode === coupon.code ? '已复制' : coupon.code}
                </button>

                {/* 装饰圆孔 */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-50" />
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-50" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
