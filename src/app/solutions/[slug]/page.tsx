import React, { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WeChatCTA from '@/components/ui/WeChatCTA';
import ProductTrustFooter from '@/components/home/ProductTrustFooter';
import CaseStudySection from '@/components/home/CaseStudySection';
import { MEDICAL_DISCLAIMER } from '@/lib/health/safety';
import { canonicalSolutionSlugs, getSolutionGuideBySlug, buildSolutionJsonLd } from "@/lib/health/solutions";
import { getCasesBySlug } from '@/lib/health/cases';

interface SolutionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSolutionGuideBySlug(slug);

  if (!guide) {
    return {
      title: "健康解决方案",
    };
  }

  return {
    title: `${guide.title} | 荣旺健康`,
    description: guide.metaDescription,
    alternates: {
      canonical: `https://rongwang.hk/solutions/${slug}`,
    },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      type: "website",
      locale: "zh_CN",
      images: [{
        url: "https://rongwang.hk/og-solution.jpg",
        width: 1200,
        height: 630,
        alt: guide.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export async function generateStaticParams() {
  return canonicalSolutionSlugs.map((slug) => ({ slug }));
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const { slug } = await params;
  const guide = getSolutionGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const cases = getCasesBySlug(slug ?? '');

  const jsonLd = buildSolutionJsonLd(slug ?? '');

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <main className="bg-[var(--bg)]">
      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="section-container py-14 md:py-18">
          <span className="badge-teal">{guide.eyebrow}</span>
          <h1 className="mt-4 text-balance text-[var(--text-primary)]">{guide.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">{guide.summary}</p>
          
          {/* 阶段2.2: 適合人群标签 */}
          {guide.targetAudience && guide.targetAudience.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {guide.targetAudience.map((tag) => (
                <span key={tag} className="inline-block rounded-full bg-[#2c504a]/10 px-3 py-1 text-xs font-medium text-[#2c504a]">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 阶段2.3: 用户评分 */}
          {guide.rating && (
            <div className="mt-5 flex items-center gap-2">
              <span className="text-lg font-bold text-[#f59e0b]">⭐ {guide.rating.score}/5.0</span>
              <span className="text-sm text-[var(--text-secondary)]">| {guide.rating.reviewCount}位用户真实评价</span>
            </div>
          )}
          
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
              开始AI自测
            </Link>
            <Link href={`/assessment/${guide.slug}`} className="btn-secondary">
              查看评估入口
            </Link>
          </div>
        </div>
      </section>

      <section className="section-container py-12 md:py-14">
        <div className="grid gap-5">
          <GuideList title="1. 症状问题" items={guide.commonSymptoms} />
          <GuideList title="2. 常见原因" items={guide.commonCauses} />
          <GuideList title="3. 什么情况要就医" items={guide.seekCareSignals} />

          <section className="rounded-lg border border-[#2c504a] bg-[var(--surface-strong)] px-5 py-7 text-white md:px-6">
            <h2 className="text-xl font-semibold">4. AI自测入口</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
              先做AI評估，系统会根据年龄、症状、生活习惯和目标生成风险等级与调理方向，不会直接先推薦商品。
            </p>
            <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary mt-6 inline-flex">
              开始AI評估
            </Link>
          </section>

          <GuideList title="5. 基础调理方案" items={guide.baselinePlan} />
          
          {/* 阶段2.2: 服用注意事项 */}
          {guide.notes && guide.notes.length > 0 && (
            <section className="card-elevated border-l-4 border-l-amber-400">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">服用注意事项</h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                {guide.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="grid gap-5 md:grid-cols-2">
            <div>
              <GuideList title="6. 营养支援方向" items={guide.supplementDirections} />
              {/* 阶段2.2: 男女配方差异 */}
              {guide.genderFormula && (
                <section className="mt-5 card-elevated border-l-4 border-l-purple-400">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">男女配方差异</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-blue-50/50 p-4">
                      <h4 className="font-semibold text-blue-700">男士调理建议</h4>
                      <ul className="mt-2 space-y-2 text-sm text-blue-900">
                        {guide.genderFormula.male.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-pink-50/50 p-4">
                      <h4 className="font-semibold text-pink-700">女士调理建议</h4>
                      <ul className="mt-2 space-y-2 text-sm text-pink-900">
                        {guide.genderFormula.female.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}
            </div>
            <GuideList title="OTC方向" items={guide.otcDirections} />
          </section>

          {/* 阶段2.3: 成分说明表格 */}
          {guide.ingredients && guide.ingredients.length > 0 && (
            <section className="card-elevated overflow-hidden">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">成分说明</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="py-3 text-left font-semibold text-[var(--text-primary)]">成分名</th>
                      <th className="py-3 text-left font-semibold text-[var(--text-primary)]">含量</th>
                      <th className="py-3 text-left font-semibold text-[var(--text-primary)]">功效</th>
                      <th className="py-3 text-left font-semibold text-[var(--text-primary)]">来源</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.ingredients.map((ing) => (
                      <tr key={ing.name} className="border-b border-[var(--border-subtle)] last:border-0">
                        <td className="py-3 font-medium text-[var(--text-primary)]">{ing.name}</td>
                        <td className="py-3 text-[var(--text-secondary)]">{ing.dosage}</td>
                        <td className="py-3 text-[var(--text-secondary)]">{ing.effect}</td>
                        <td className="py-3 text-[var(--text-secondary)]">{ing.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="card-elevated border-[#cfe7df] bg-[#e8f5f1]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">7. 完成評估后查看推薦</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
              本页只提供问题理解和调理方向。是否适合营养支援、OTC或购买入口，需要先完成AI健康評估；如识别到较高风险信号，将不会展示购买入口。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
                先完成AI健康評估
              </Link>
              <Link href={`/assessment/${guide.slug}`} className="btn-secondary">
                查看评估说明
              </Link>
            </div>
          </section>

          {/* 阶段2.3: 荣旺方案 vs 普通方案对比 */}
          {guide.comparison && guide.comparison.length > 0 && (
            <section className="card-elevated overflow-hidden">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">荣旺方案 vs 普通方案</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="py-3 text-left font-semibold text-[#2c504a]">荣旺方案</th>
                      <th className="py-3 text-left font-semibold text-[var(--text-secondary)]">普通方案</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.comparison.map((item, idx) => (
                      <tr key={idx} className="border-b border-[var(--border-subtle)] last:border-0">
                        <td className="py-3 font-medium text-[#2c504a]">✅ {item.our}</td>
                        <td className="py-3 text-[var(--text-secondary)]">⚪ {item.normal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 阶段4.1: 真实案例展示 */}
          <CaseStudySection cases={cases} />

          {/* 阶段2.2: 组合推薦 */}
          {guide.comboRecommendation && guide.comboRecommendation.length > 0 && (
            <section className="card-elevated border-l-4 border-l-green-500">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">组合推薦</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {guide.comboRecommendation.map((combo) => (
                  <div key={combo.title} className="rounded-lg bg-green-50/50 p-4">
                    <h4 className="font-semibold text-green-700">{combo.title}</h4>
                    <ul className="mt-2 space-y-1 text-sm text-green-900">
                      {combo.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-green-700">{combo.note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 顾问入口 */}
          <section className="from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block rounded-full bg-orange-400/20 px-3 py-1 text-xs font-semibold text-orange-700 mb-3">
                  顾问支援
                </span>
                <h2 className="text-xl font-bold text-slate-900">不确定自己适合哪个方案？</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  顾问可以根据你的年龄、症状和体检报告，推薦最适合的产品组合和服用周期。免费判断，不强制购买。
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/ai-consult" className="btn-primary">
                    先做AI評估
                  </Link>
                  <a
                    href="https://u.wechat.com/E/rongwanghealth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    添加顾问微信
                  </a>
                </div>
              </div>
              <div className="flex justify-center">
                <WeChatCTA
                  title="扫码添加健康顾问"
                  description="领取專屬方案，1对1指导"
                  cardMode={false}
                />
              </div>
            </div>
          </section>

          {/* 产品页底部信任栏 */}
          <ProductTrustFooter />

          <section className="rounded-lg border border-[#ead7c6] bg-[#fff7ed] px-5 py-6 text-sm leading-7 text-[#70442f]">
            <h2 className="text-lg font-semibold">8. 免责声明</h2>
            <p className="mt-4">{MEDICAL_DISCLAIMER}</p>
          </section>
        </div>
      </section>
    </main>
    </>
  );
}

function GuideList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="card-elevated">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
