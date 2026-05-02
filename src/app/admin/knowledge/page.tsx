import Link from "next/link";
import {
  assertKnowledgeDoesNotSelectSku,
  isReviewedKnowledgeEntry,
  listKnowledgeEntriesForAdmin,
} from "@/lib/data/knowledge";

const statusStyle = {
  reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  retired: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

export default async function AdminKnowledgePage() {
  const entries = await listKnowledgeEntriesForAdmin();
  const reviewedCount = entries.filter(isReviewedKnowledgeEntry).length;

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Knowledge</span>
            <h1 className="mt-4 text-slate-900">Health And OTC Knowledge Base</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Public AI copy may use reviewed entries only. Product links here are educational context, not SKU selection rules.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total entries</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{entries.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Reviewed for public use</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{reviewedCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Education-only product links</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {entries.every(assertKnowledgeDoesNotSelectSku) ? "OK" : "Review"}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {entries.map((entry) => (
            <article key={entry.slug} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{entry.title}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        statusStyle[entry.status] ?? statusStyle.draft
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{entry.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="badge-slate">{entry.category}</span>
                    {entry.tags.map((tag) => (
                      <span key={tag} className="badge-slate">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{entry.sourceTitle ?? "No source"}</p>
                  <p className="mt-1">{entry.updatedAt}</p>
                </div>
              </div>

              {(entry.redFlags.length > 0 || entry.contraindications.length > 0) && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <p className="text-sm font-semibold text-rose-800">Red flags</p>
                    <p className="mt-2 text-sm leading-7 text-rose-700">
                      {entry.redFlags.length > 0 ? entry.redFlags.join(" / ") : "None"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">Contraindications</p>
                    <p className="mt-2 text-sm leading-7 text-amber-700">
                      {entry.contraindications.length > 0 ? entry.contraindications.join(" / ") : "None"}
                    </p>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
