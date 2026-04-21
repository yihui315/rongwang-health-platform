'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';
import type { PlanSlug } from '@/types';

const plans = [
  {
    slug: 'fatigue' as PlanSlug,
    title: '抗疲劳组合',
    desc: '适合长期忙碌、精力容易透支的人群',
    price: 299,
    ingredients: ['活性B族', '螯合镁', 'Omega-3'],
    gradient: 'from-amber-400 to-orange-500',
    iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    href: '/plans/fatigue',
    badge: '最热门',
    image: '/images/bundles/bundle-fatigue.png',
  },
  {
    slug: 'sleep' as PlanSlug,
    title: '深度睡眠组合',
    desc: '适合入睡困难、浅睡、夜醒频繁的人群',
    price: 259,
    ingredients: ['GABA', '镁', '褪黑素'],
    gradient: 'from-indigo-400 to-violet-600',
    iconPath: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
    href: '/plans/sleep',
    badge: null,
    image: '/images/bundles/bundle-sleep.png',
  },
  {
    slug: 'immune' as PlanSlug,
    title: '免疫防护组合',
    desc: '适合换季易感冒、身体防御力偏弱的人群',
    price: 349,
    ingredients: ['维C', '锌', '维D3', '接骨木莓'],
    gradient: 'from-emerald-400 to-teal-600',
    iconPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    href: '/plans/immune',
    badge: null,
    image: '/images/bundles/bundle-immune.png',
  },
  {
    slug: 'stress' as PlanSlug,
    title: '压力缓解组合',
    desc: '适合长期紧绷、焦虑、状态不稳定的人群',
    price: 399,
    ingredients: ['B族', '镁', '适应原草本'],
    gradient: 'from-rose-400 to-pink-600',
    iconPath: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
    href: '/plans/stress',
    badge: '高端',
    image: null,
  },
];

export default function PlanGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan, idx) => (
        <div
          key={plan.slug}
          className="group relative rounded-2xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col animate-fade-up"
          style={{ animationDelay: `${idx * 80}ms`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {/* Top image or color bar */}
          {plan.image ? (
            <div className={`relative h-36 bg-gradient-to-br ${plan.gradient} overflow-hidden`}>
              <Image
                src={plan.image}
                alt={plan.title}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${plan.gradient} opacity-30`} />
              {plan.badge && (
                <span className="absolute top-3 right-3 rounded-full bg-slate-900/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wide z-10">
                  {plan.badge}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className={`h-1.5 bg-gradient-to-r ${plan.gradient}`} />
              {plan.badge && (
                <div className="flex justify-end px-6 pt-4">
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}
            </>
          )}

          <div className="p-6 flex flex-col flex-1">
            {/* Icon row */}
            <div className="flex items-start justify-between mb-4">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-sm`}>
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={plan.iconPath} />
                </svg>
              </div>
            </div>

            <Link href={plan.href}>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors tracking-tight">
                {plan.title}
              </h3>
            </Link>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 flex-1">{plan.desc}</p>

            {/* Ingredients */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {plan.ingredients.map((ing) => (
                <span key={ing} className="rounded-full bg-slate-50 ring-1 ring-slate-200/60 px-2.5 py-0.5 text-[11px] text-slate-600 font-medium">
                  {ing}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">¥{plan.price}</span>
                <span className="text-[13px] text-slate-400">/月</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              <AddToCartButton slug={plan.slug} name={plan.title} price={plan.price} className="w-full text-[13px] px-4 py-2.5 rounded-full" />
              <Link href={plan.href} className="block text-center text-[13px] font-medium text-slate-500 hover:text-teal-600 transition-colors py-1">
                查看详情
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
