import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/data/analytics-events";
import { getPddClickSummary } from "@/lib/data/pdd-clicks";

export default async function AdminAnalyticsPage() {
  const [eventSummary, summary] = await Promise.all([
    getAnalyticsSummary(),
    getPddClickSummary(),
  ]);

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Analytics</span>
            <h1 className="mt-4 text-slate-900">Click Attribution</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              PDD click analytics read through the Prisma-first attribution layer and fall back to the legacy Supabase table during migration.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard title="Assessment start" value={eventSummary.byName.assessment_started} note="AI evaluation started" />
          <MetricCard title="Completion rate" value={`${Math.round(eventSummary.completionRate * 100)}%`} note={`${eventSummary.byName.assessment_completed} completed`} />
          <MetricCard title="Recommendation CTR" value={`${Math.round(eventSummary.recommendationClickRate * 100)}%`} note={`${eventSummary.byName.recommendation_clicked} recommendation clicks`} />
          <MetricCard title="PDD redirect rate" value={`${Math.round(eventSummary.pddRedirectRate * 100)}%`} note={`${eventSummary.byName.pdd_redirect_clicked} redirect events`} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tracked clicks</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.total}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Total rows loaded for this dashboard window.
            </p>
          </div>
          <BreakdownCard title="Source pages" items={summary.bySource} />
          <BreakdownCard title="Solution types" items={summary.bySolution} />
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent outbound clicks</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Each row keeps enough context to connect a redirect with session, consultation, source page, solution, ref, and destination URL.
              </p>
            </div>
            <span className="badge-slate">{summary.recent.length} shown</span>
          </div>

          <div className="mt-5 space-y-3">
            {summary.recent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                No PDD redirect clicks have been recorded yet.
              </div>
            ) : (
              summary.recent.map((click) => (
                <div key={click.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-teal-700">
                        {click.productSlug ?? click.productId ?? "unknown-product"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Source: {click.source ?? "unknown"} | Solution: {click.solutionSlug ?? "unknown"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Session: {click.sessionId ?? "-"} | Consultation: {click.consultationId ?? "-"}
                      </p>
                      {click.destinationUrl ? (
                        <p className="mt-1 break-all text-sm leading-6 text-slate-500">
                          Destination: {click.destinationUrl}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <span className="badge-slate">{click.ref ?? "no-ref"}</span>
                      <p className="mt-3">{click.createdAt || "no timestamp"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ title, value, note }: { title: string; value: string | number; note: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
    </div>
  );
}

function BreakdownCard({ title, items }: { title: string; items: Array<{ key: string; count: number }> }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="mt-4 space-y-2">
        {items.slice(0, 5).map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-600">{item.key}</span>
            <span className="font-semibold text-slate-900">{item.count}</span>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No data yet.</p>
        ) : null}
      </div>
    </div>
  );
}
