import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FreeToolAssessment } from "@/components/marketing/FreeToolAssessment";
import { freeToolSlugs, getFreeToolBySlug } from "@/lib/marketing/free-tools";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return freeToolSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getFreeToolBySlug(slug);

  if (!tool) {
    return {
      title: "健康自测工具",
    };
  }

  return {
    title: `${tool.shortTitle} | 荣旺健康`,
    description: tool.metaDescription,
  };
}

export default async function FreeToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getFreeToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  return (
    <main className="bg-[var(--bg)]">
      <section className="border-b border-slate-100 bg-white">
        <div className="section-container grid gap-10 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-20">
          <div>
            <span className="badge-teal">免费健康工具</span>
            <h1 className="mt-4 text-balance text-slate-900">{tool.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-500">{tool.hero}</p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">{tool.useCase}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={tool.primaryCta.href} className="btn-primary">
                {tool.primaryCta.label}
              </Link>
              {tool.solutionHref ? (
                <Link href={tool.solutionHref} className="btn-secondary">
                  查看完整健康方案
                </Link>
              ) : (
                <Link href="/assessment/sleep" className="btn-secondary">
                  按问题进入评估入口
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-teal-100 bg-teal-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-teal-800">AI-first 路径</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-white p-4">1. 先用轻量问题梳理信号</div>
              <div className="rounded-2xl bg-white p-4">2. 再进入完整 AI 健康评估</div>
              <div className="rounded-2xl bg-white p-4">3. 最后由规则引擎匹配方案方向</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-16">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <FreeToolAssessment tool={tool} />
          <section className="card-elevated">
            <span className="badge-teal">结果解释</span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">结果如何理解</h2>
            <div className="mt-6 grid gap-4">
              {tool.scoreBands.map((band) => (
                <article
                  key={band.id}
                  className={
                    band.careFirst
                      ? "rounded-3xl border border-orange-200 bg-orange-50 p-5"
                      : "rounded-3xl border border-slate-200 bg-white p-5"
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-900">{band.label}</h3>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      {band.min}-{band.max} 分
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{band.description}</p>
                  {band.careFirst ? (
                    <p className="mt-3 text-sm font-semibold text-orange-900">此等级优先建议就医或咨询药师，不展示购买入口。</p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold">完成自测后，建议进入完整 AI 评估</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
                免费工具只用于快速分层，不替代完整健康资料收集。完整评估会结合年龄、性别、症状、持续时间、生活习惯、用药和过敏史生成更稳妥的教育建议。
              </p>
            </div>
            <Link href={tool.primaryCta.href} className="btn-primary whitespace-nowrap">
              {tool.primaryCta.label}
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-orange-200 bg-orange-50 px-6 py-6 text-sm leading-7 text-orange-900">
          <h2 className="text-lg font-semibold">免责声明</h2>
          <p className="mt-3">{tool.disclaimer}</p>
        </section>
      </section>
    </main>
  );
}
