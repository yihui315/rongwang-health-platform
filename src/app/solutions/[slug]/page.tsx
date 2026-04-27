import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { MEDICAL_DISCLAIMER } from "@/lib/health/safety";
import { canonicalSolutionSlugs, getSolutionGuideBySlug } from "@/lib/health/solutions";

interface SolutionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSolutionGuideBySlug(slug);

  if (!guide) {
    return {
      title: "解决方案",
    };
  }

  return {
    title: guide.title,
    description: guide.metaDescription,
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

  return (
    <main className="bg-[var(--bg)]">
      <section className="border-b border-slate-100 bg-white">
        <div className="section-container py-16 md:py-20">
          <span className="badge-teal">{guide.eyebrow}</span>
          <h1 className="mt-4 text-balance text-slate-900">{guide.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-500">{guide.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
              立即开始 AI 自测
            </Link>
            <Link href={`/assessment/${guide.slug}`} className="btn-secondary">
              查看评估入口
            </Link>
          </div>
        </div>
      </section>

      <section className="section-container py-16">
        <div className="grid gap-6">
          <section className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">1. 症状问题</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.commonSymptoms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">2. 常见原因</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.commonCauses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">3. 什么情况要就医</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.seekCareSignals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-8 text-white">
            <h2 className="text-xl font-semibold">4. AI 自测入口</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
              先做 AI 评估，系统会根据年龄、症状、生活习惯和目标生成风险等级与调理方向，不会直接先推商品。
            </p>
            <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary mt-6 inline-flex">
              开始 AI 评估
            </Link>
          </section>

          <section className="card-elevated">
            <h2 className="text-xl font-semibold text-slate-900">5. 基础调理方案</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {guide.baselinePlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="card-elevated">
              <h2 className="text-xl font-semibold text-slate-900">6. 保健品方向</h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                {guide.supplementDirections.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card-elevated">
              <h2 className="text-xl font-semibold text-slate-900">OTC 方向</h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                {guide.otcDirections.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card-elevated border-teal-100 bg-teal-50/70">
            <h2 className="text-xl font-semibold text-slate-900">7. 完成评估后查看推荐</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              本页只提供问题理解和调理方向。具体是否适合保健品、OTC 或购买入口，需要先完成 AI
              健康评估，由系统结合年龄、症状、生活习惯、用药和过敏信息进行风险分层；如识别到高风险信号，将不会展示购买入口。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
                先完成 AI 健康评估
              </Link>
              <Link href={`/assessment/${guide.slug}`} className="btn-secondary">
                查看评估说明
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-orange-200 bg-orange-50 px-6 py-6 text-sm leading-7 text-orange-900">
            <h2 className="text-lg font-semibold">8. 免责声明</h2>
            <p className="mt-4">{MEDICAL_DISCLAIMER}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
