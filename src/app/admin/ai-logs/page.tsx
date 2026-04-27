import Link from "next/link";
import { listConsultations } from "@/lib/data/consultations";

export default async function AdminAiLogsPage() {
  const rows = await listConsultations(100);
  const logs = rows.filter(
    (row) => row.aiProvider || row.aiModel || row.promptVersion || row.aiStatus,
  );

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">AI Logs</span>
            <h1 className="mt-4 text-slate-900">AI Consultation Audit</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Read-only audit view for provider, model, prompt version, and fallback status captured during the new consultation pipeline rollout.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500">
              No structured AI log metadata is available yet.
            </div>
          ) : (
            logs.map((row) => (
              <div key={row.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-teal-700">{row.id}</p>
                    <p className="text-sm text-slate-600">
                      Provider: {row.aiProvider ?? "legacy"} | Model: {row.aiModel ?? "-"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Prompt: {row.promptVersion ?? "-"} | Status: {row.aiStatus ?? "legacy"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Fallback used: {row.fallbackUsed ? "yes" : "no"} | Risk: {row.riskLevel}
                    </p>
                    {row.aiErrorMessage && (
                      <p className="max-w-3xl text-sm leading-6 text-rose-600">
                        Error: {row.aiErrorMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="badge-slate">{row.source ?? "unknown-source"}</span>
                    <p className="mt-3 text-sm text-slate-500">{row.createdAt || "no timestamp"}</p>
                    <Link href={`/admin/ai-logs/${row.id}`} className="btn-secondary mt-4 inline-flex">
                      View detail
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
