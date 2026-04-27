'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { getAiConsultHrefForValue, getSolutionHrefForValue } from '@/lib/health/consult-entry';
import type { PlanSlug } from '@/types';

const plans = [
  {
    slug: 'fatigue' as PlanSlug,
    title: '抗疲劳恢复组合',
    desc: '面向长期熬夜、下午犯困、精力不足的人群，先评估疲劳来源，再匹配营养支持方向。',
    price: 299,
    ingredients: ['NADH', '辅酶 Q10', 'Omega-3'],
    gradient: 'from-amber-400 to-orange-500',
    iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    badge: '热门方案',
    image: '/images/bundles/bundle-fatigue.png',
  },
  {
    slug: 'sleep' as PlanSlug,
    title: '深度睡眠支持组合',
    desc: '适合入睡困难、夜醒、多梦浅睡等睡眠困扰，帮助你先识别风险，再看调理方案。',
    price: 259,
    ingredients: ['GABA', '镁', '茶氨酸'],
    gradient: 'from-indigo-400 to-violet-600',
    iconPath: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
    badge: null,
    image: '/images/bundles/bundle-sleep.png',
  },
  {
    slug: 'immune' as PlanSlug,
    title: '免疫防护组合',
    desc: '面向换季易感、恢复慢、日常防护需求较高的人群，强调基础营养与生活方式配合。',
    price: 349,
    ingredients: ['维生素 C', '锌', '维生素 D3', '益生菌'],
    gradient: 'from-emerald-400 to-teal-600',
    iconPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    badge: null,
    image: '/images/bundles/bundle-immune.png',
  },
  {
    slug: 'stress' as PlanSlug,
    title: '压力舒缓组合',
    desc: '适合长期紧绷、情绪波动、注意力下降等压力相关困扰，建议先完成 AI 评估。',
    price: 399,
    ingredients: ['B 族维生素', '镁', '茶氨酸'],
    gradient: 'from-rose-400 to-pink-600',
    iconPath: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
    badge: '情绪支持',
    image: null,
  },
];

export default function PlanGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan, idx) => {
        const consultHref = getAiConsultHrefForValue(plan.slug);
        const detailHref = getSolutionHrefForValue(plan.slug) ?? consultHref;

        return (
          <div
            key={plan.slug}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-up"
            style={{ animationDelay: `${idx * 80}ms`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            {plan.image ? (
              <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${plan.gradient}`}>
                <Image
                  src={plan.image}
                  alt={plan.title}
                  fill
                  className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${plan.gradient} opacity-30`} />
                {plan.badge ? (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm">
                    {plan.badge}
                  </span>
                ) : null}
              </div>
            ) : (
              <>
                <div className={`h-1.5 bg-gradient-to-r ${plan.gradient}`} />
                {plan.badge ? (
                  <div className="flex justify-end px-6 pt-4">
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                      {plan.badge}
                    </span>
                  </div>
                ) : null}
              </>
            )}

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} shadow-sm`}>
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={plan.iconPath} />
                  </svg>
                </div>
              </div>

              <Link href={detailHref}>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-teal-600">
                  {plan.title}
                </h3>
              </Link>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-500">{plan.desc}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {plan.ingredients.map((ing) => (
                  <span key={ing} className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/60">
                    {ing}
                  </span>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">HK${plan.price}</span>
                  <span className="text-[13px] text-slate-400">/ 方案</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  href={consultHref}
                  className="block rounded-full bg-slate-900 px-4 py-2.5 text-center text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  先做 AI 评估
                </Link>
                <Link href={detailHref} className="block py-1 text-center text-[13px] font-medium text-slate-500 transition-colors hover:text-teal-600">
                  查看方案详情
                </Link>
                <AddToCartButton
                  slug={plan.slug}
                  name={plan.title}
                  price={plan.price}
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
