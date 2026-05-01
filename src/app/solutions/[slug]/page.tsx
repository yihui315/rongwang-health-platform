import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
      title: "健康解决方案",
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
      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="section-container py-14 md:py-18">
          <span className="badge-teal">{guide.eyebrow}</span>
          <h1 className="mt-4 text-balance text-[var(--text-primary)]">{guide.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">{guide.summary}</p>
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
              先做AI评估，系统会根据年龄、症状、生活习惯和目标生成风险等级与调理方向，不会直接先推荐商品。
            </p>
            <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary mt-6 inline-flex">
              开始AI评估
            </Link>
          </section>

          <GuideList title="5. 基础调理方案" items={guide.baselinePlan} />

          <section className="grid gap-5 md:grid-cols-2">
            <GuideList title="6. 营养支持方向" items={guide.supplementDirections} />
            <GuideList title="OTC方向" items={guide.otcDirections} />
          </section>

          <section className="card-elevated border-[#cfe7df] bg-[#e8f5f1]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">7. 完成评估后查看推荐</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
              本页只提供问题理解和调理方向。是否适合营养支持、OTC或购买入口，需要先完成AI健康评估；如识别到较高风险信号，将不会展示购买入口。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/ai-consult?focus=${guide.slug}`} className="btn-primary">
                先完成AI健康评估
              </Link>
              <Link href={`/assessment/${guide.slug}`} className="btn-secondary">
                查看评估说明
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-[#ead7c6] bg-[#fff7ed] px-5 py-6 text-sm leading-7 text-[#70442f]">
            <h2 className="text-lg font-semibold">8. 免责声明</h2>
            <p className="mt-4">{MEDICAL_DISCLAIMER}</p>
          </section>
        </div>
      </section>
    </main>
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
