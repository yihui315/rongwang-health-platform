import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canonicalSolutionSlugs, getSolutionGuideBySlug } from "@/lib/health/solutions";
import { MEDICAL_DISCLAIMER_SHORT } from "@/lib/health/safety";

interface AssessmentPageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: AssessmentPageProps): Promise<Metadata> {
  const { type } = await params;
  const guide = getSolutionGuideBySlug(type);

  if (!guide) {
    return {
      title: "评估入口",
    };
  }

  return {
    title: `${guide.shortTitle}健康评估`,
    description: `了解${guide.shortTitle}方向是否适合你，3分钟AI评估生成个性化风险分层。`,
  };
}

export async function generateStaticParams() {
  return canonicalSolutionSlugs.map((type) => ({ type }));
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { type } = await params;
  const guide = getSolutionGuideBySlug(type);

  if (!guide) {
    notFound();
  }

  return (
    <main className="bg-[var(--bg)]">
      {/* Hero: 单一职责 — 引导进入AI评估 */}
      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="section-container py-16 md:py-20">
          <span className="badge-teal">{guide.eyebrow}</span>

          <h1 className="mt-4 text-3xl font-bold text-balance text-[var(--text-primary)] md:text-4xl">
            {guide.shortTitle}健康评估
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            开始 AI 评估前，先确认这个方向是否适合你。
          </p>

          {/* 适合人群：不超过5条，直接引用guide数据 */}
          {guide.targetAudience && guide.targetAudience.length > 0 && (
            <ul className="mt-6 space-y-2 text-sm text-[var(--text-secondary)]">
              {guide.targetAudience.slice(0, 5).map((tag) => (
                <li key={tag} className="flex items-start gap-2">
                  <span className="mt-1 text-[var(--accent-teal)]">✓</span>
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {/* 唯一主CTA */}
          <div className="mt-8">
            <Link
              href={`/ai-consult?focus=${guide.slug}`}
              className="btn-primary text-base"
            >
              开始 AI 评估 →
            </Link>
          </div>

          <p className="mt-4 text-xs text-[var(--text-secondary)]">
            {MEDICAL_DISCLAIMER_SHORT}
          </p>
        </div>
      </section>

      {/* Footer 免责声明 */}
      <section className="section-container py-10">
        <div className="rounded-lg border border-[#ead7c6] bg-[#fff7ed] px-5 py-6 text-sm leading-7 text-[#70442f]">
          {MEDICAL_DISCLAIMER_SHORT}
        </div>
      </section>
    </main>
  );
}
