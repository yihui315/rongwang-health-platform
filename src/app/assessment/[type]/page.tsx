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
      <section className="border-b border-slate-100 bg-white">
        <div className="section-container py-16 md:py-20">
          <span className="badge-teal">{guide.shortTitle}</span>
          <h1 className="mt-4 text-balance text-slate-900">{guide.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-500">{guide.assessmentIntro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
              开始 AI 自测
            </Link>
            <Link href={`/solutions/${guide.slug}`} className="btn-secondary">
              先看方案页
            </Link>
          </div>
        </div>
      </section>

      <section className="section-container py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">常见表现</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.commonSymptoms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">常见原因</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.commonCauses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">先做什么</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.baselinePlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">这些情况要先就医</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.seekCareSignals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-orange-200 bg-orange-50 px-6 py-6 text-sm leading-7 text-orange-900">
          {MEDICAL_DISCLAIMER}
        </div>
      </section>
    </main>
  );
}
