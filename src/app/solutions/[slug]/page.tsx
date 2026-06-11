import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WeChatCTA from '@/components/ui/WeChatCTA';
import ProductTrustFooter from '@/components/home/ProductTrustFooter';
import { MEDICAL_DISCLAIMER } from '@/lib/health/safety';
import { canonicalSolutionSlugs, getSolutionGuideBySlug, buildSolutionJsonLd } from "@/lib/health/solutions";

interface SolutionPageProps {
  params: Promise<{ slug: string }>;
}

// 阶段3：作者/审核/日期元数据
interface SolutionMeta {
  author: string;
  reviewer: string;
  lastReviewed: string;
}

const solutionMetaRecord: Record<string, SolutionMeta> = {
  sleep: { author: "张明营养师", reviewer: "李医生", lastReviewed: "2025-11-15" },
  fatigue: { author: "张明营养师", reviewer: "王医生", lastReviewed: "2025-11-15" },
  liver: { author: "张明营养师", reviewer: "李医生", lastReviewed: "2025-11-20" },
  immune: { author: "张明营养师", reviewer: "王医生", lastReviewed: "2025-11-15" },
  "female-health": { author: "陈晓燕营养师", reviewer: "刘医生", lastReviewed: "2025-12-01" },
  "male-health": { author: "张明营养师", reviewer: "李医生", lastReviewed: "2025-11-25" },
};

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

        {/* ── Hero: 单一职责 — 引导进入AI评估 ── */}
        <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
          <div className="section-container py-14 md:py-18">
            <span className="badge-teal">{guide.eyebrow}</span>

            <h1 className="mt-4 text-3xl font-bold text-balance text-[var(--text-primary)] md:text-4xl">
              {guide.title}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              {guide.summary}
            </p>

            {/* 适合人群标签 */}
            {guide.targetAudience && guide.targetAudience.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {guide.targetAudience.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full bg-[#2c504a]/10 px-3 py-1 text-xs font-medium text-[#2c504a]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 用户评分 */}
            {guide.rating && (
              <div className="mt-5 flex items-center gap-2">
                <span className="text-lg font-bold text-[#f59e0b]">
                  ⭐ {guide.rating.score}/5.0
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  | {guide.rating.reviewCount} 位用户真实评价
                </span>
              </div>
            )}

            {/* 阶段3：证据等级标注 */}
            {guide.evidenceLevel && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--text-primary)]">证据等级：</span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  guide.evidenceLevel === 'A' ? 'bg-green-100 text-green-700' :
                  guide.evidenceLevel === 'B' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {guide.evidenceLevel === 'A' ? 'A 级（高质量证据）' :
                   guide.evidenceLevel === 'B' ? 'B 级（中等质量证据）' :
                   'C 级（低质量证据）'}
                </span>
                {guide.evidenceSource && (
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      查看证据来源 →
                    </summary>
                    <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {guide.evidenceSource}
                    </p>
                  </details>
                )}
              </div>
            )}

            {/* 阶段3：作者/审核/日期元数据 */}
            {(() => {
              const meta = solutionMetaRecord[slug ?? ''];
              if (!meta) return null;
              return (
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--text-tertiary)]">
                  <span>作者：{meta.author}</span>
                  <span>审核：{meta.reviewer}</span>
                  <span>最近更新：{meta.lastReviewed}</span>
                </div>
              );
            })()}

            {/* 唯一主CTA */}
            <div className="mt-8">
              <Link
                href={`/ai-consult?focus=${guide.slug}`}
                className="btn-primary text-base"
              >
                先做 AI 评估 →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 主体内容 ── */}
        <section className="section-container py-12 md:py-14">
          <div className="grid gap-8">

            {/* 1. 适合人群详解 */}
            {guide.targetAudience && guide.targetAudience.length > 0 && (
              <div className="card-elevated">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  这个方案适合谁
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {guide.targetAudience.map((tag) => (
                    <li key={tag} className="flex items-start gap-2">
                      <span className="mt-1 text-[var(--accent-teal)]">✓</span>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 2. 生活方式建议（简化版，最多5条） */}
            {guide.baselinePlan && guide.baselinePlan.length > 0 && (
              <div className="card-elevated">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  可以先做的生活方式调整
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {guide.baselinePlan.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. 营养支持方向 */}
            {guide.supplementDirections && guide.supplementDirections.length > 0 && (
              <div className="card-elevated">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  营养支持方向
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {guide.supplementDirections.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. 组合推荐（方案预览，无购买按钮） */}
            {guide.comboRecommendation && guide.comboRecommendation.length > 0 && (
              <div className="card-elevated border-l-4 border-l-green-500">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  健康方向包预览
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  完成 AI 评估后，将根据你的个人情况推荐最合适的组合。
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {guide.comboRecommendation.map((combo) => (
                    <div
                      key={combo.title}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg)] p-4"
                    >
                      <h4 className="font-semibold text-[var(--text-primary)]">
                        {combo.title}
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                        {combo.items.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                      {combo.note && (
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">
                          {combo.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. 顾问支援 */}
            <section className="from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="mb-3 inline-block rounded-full bg-orange-400/20 px-3 py-1 text-xs font-semibold text-orange-700">
                    顾问支援
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    不确定自己适合哪个方案？
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    顾问可以根据你的年龄、症状和体检报告，推荐最适合的产品组合和服用周期。
                    免费判断，不强制购买。
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
                      先做 AI 评估
                    </Link>
                    <WeChatCTA
                      title="扫码添加健康顾问"
                      description="领取專屬方案，1对1指导"
                      cardMode={false}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 6. 产品信任栏 */}
            <ProductTrustFooter />

            {/* 7. 免责声明 */}
            <div className="rounded-lg border border-[#ead7c6] bg-[#fff7ed] px-5 py-6 text-sm leading-7 text-[#70442f]">
              <h2 className="text-lg font-semibold">免责声明</h2>
              <p className="mt-4">{MEDICAL_DISCLAIMER}</p>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
