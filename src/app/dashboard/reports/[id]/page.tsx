"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ReportDetail {
  id: string;
  title: string;
  riskLevel: string;
  recommendedSolutionType: string | null;
  createdAt: string;
  profile: {
    age?: number;
    gender?: string;
    symptoms?: string[];
    goal?: string;
  };
  result: {
    summary?: string;
    possibleFactors?: string[];
    lifestyleAdvice?: string[];
    supplementDirections?: string[];
    otcDirections?: string[];
    redFlags?: string[];
    productRecommendationReason?: string;
  };
  safety: {
    clinicianAdvice?: string[];
    commerceAllowed?: boolean;
  };
  recommendations: Array<{
    productSlug?: string;
    name?: string;
    reason?: string;
  }>;
  disclaimer: string | null;
}

function list(items: unknown) {
  return Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : [];
}

export default function DashboardReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assessment-reports/${params.id}`)
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        const payload = await response.json();
        return payload.report as ReportDetail;
      })
      .then(setReport)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">
          正在加载报告...
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-slate-900">未找到报告</h1>
          <Link href="/dashboard" className="mt-5 inline-flex btn-secondary">
            返回 Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const suppressCommerce = report.riskLevel === "urgent" || report.riskLevel === "high";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="btn-secondary">
          返回 Dashboard
        </Link>

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="badge-teal">Assessment Report</span>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">{report.title}</h1>
              <p className="mt-2 text-sm text-slate-500">
                {new Date(report.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <span className="badge-slate">{report.riskLevel}</span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">基础信息快照</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                年龄：{report.profile.age ?? "-"}；性别：{report.profile.gender ?? "-"}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                目标：{report.profile.goal ?? "-"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {list(report.profile.symptoms).map((symptom) => (
                  <span key={symptom} className="badge-slate">
                    {symptom}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">AI 总结</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {report.result.summary ?? "暂无总结"}
              </p>
            </section>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              ["可能因素", report.result.possibleFactors],
              ["生活方式建议", report.result.lifestyleAdvice],
              ["补充剂方向", report.result.supplementDirections],
              ["OTC 教育方向", report.result.otcDirections],
            ].map(([title, items]) => (
              <section key={String(title)} className="rounded-2xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900">{String(title)}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                  {list(items).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <h2 className="text-lg font-semibold text-rose-900">风险与就医提示</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-rose-700">
              {[...list(report.result.redFlags), ...list(report.safety.clinicianAdvice)].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {!suppressCommerce && report.recommendations.length > 0 && (
            <section className="mt-5 rounded-2xl border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">保存时的规则推荐快照</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {report.recommendations.map((item) => (
                  <div key={item.productSlug ?? item.name} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{item.name ?? item.productSlug}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {report.disclaimer && (
            <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-500">
              {report.disclaimer}
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
