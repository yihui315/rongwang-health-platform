import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canonicalSolutionSlugs, getSolutionGuideBySlug } from "@/lib/health/solutions";
import { MEDICAL_DISCLAIMER } from "@/lib/health/safety";

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
    title: `${guide.shortTitle}入口`,
    description: guide.metaDescription,
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
      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="section-container py-14 md:py-18">
          <span className="badge-teal">{guide.shortTitle}</span>
          <h1 className="mt-4 text-balance text-[var(--text-primary)]">{guide.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">{guide.assessmentIntro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
              开始AI自测
            </Link>
            <Link href={`/solutions/${guide.slug}`} className="btn-secondary">
              先看方案页
            </Link>
          </div>
        </div>
      </section>

      <section className="section-container py-12 md:py-14">
        <div className="grid gap-5 md:grid-cols-2">
          <AssessmentBlock title="常见表现" items={guide.commonSymptoms} />
          <AssessmentBlock title="常见原因" items={guide.commonCauses} />
          <AssessmentBlock title="先做什么" items={guide.baselinePlan} />
          <AssessmentBlock title="这些情况要先就医" items={guide.seekCareSignals} />
        </div>

        <div className="mt-8 rounded-lg border border-[#ead7c6] bg-[#fff7ed] px-5 py-6 text-sm leading-7 text-[#70442f]">
          {MEDICAL_DISCLAIMER}
        </div>
      </section>
    </main>
  );
}

function AssessmentBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card-elevated">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
