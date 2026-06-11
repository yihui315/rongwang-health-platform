import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { solutionGuides } from '@/lib/health/solutions';
import { getSiteUrl } from '@/lib/site';
import ProductTrustFooter from '@/components/home/ProductTrustFooter';

export const metadata: Metadata = {
  title: '健康解决方案 | 荣旺健康',
  description: '围绕睡眠、疲劳、肝脏、免疫、男性健康、女性健康六大问题，提供 AI 评估与个性化健康支持方案。',
  alternates: {
    canonical: `${getSiteUrl()}/solutions`,
  },
  openGraph: {
    title: '健康解决方案 | 荣旺健康',
    description: '围绕睡眠、疲劳、肝脏、免疫、男性健康、女性健康六大问题，提供 AI 评估与个性化健康支持方案。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function SolutionsPage() {
  const SITE_URL = getSiteUrl();

  return (
    <main className="bg-[var(--bg)]">
      {/* Hero */}
      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="section-container py-14 md:py-18 text-center">
          <span className="badge-teal">健康解决方案</span>
          <h1 className="mt-4 text-3xl font-bold text-balance text-[var(--text-primary)] md:text-4xl">
            科学分层，对症支持
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-[var(--text-secondary)]">
            先评估，再匹配。根据你的症状和生活习惯，推荐最适合的支持方向。
          </p>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="section-container py-12 md:py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutionGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/solutions/${guide.slug}`}
              className="card-elevated group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <span className="text-xs font-medium text-[var(--accent-teal)] mb-2 block">
                    {guide.eyebrow}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">
                    {guide.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {guide.summary}
                  </p>

                  {guide.targetAudience && guide.targetAudience.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {guide.targetAudience.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-[#2c504a]/10 px-2.5 py-0.5 text-xs text-[#2c504a]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {guide.rating && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm font-bold text-[#f59e0b]">
                        ⭐ {guide.rating.score}/5.0
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {guide.rating.reviewCount} 条评价
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--accent-teal)]">
                    了解方案
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            不确定哪个方案适合你？
          </p>
          <Link href="/ai-consult" className="btn-primary">
            做 AI 健康评估 →
          </Link>
        </div>
      </section>

      {/* Trust footer */}
      <section className="section-container pb-12">
        <ProductTrustFooter />
      </section>
    </main>
  );
}