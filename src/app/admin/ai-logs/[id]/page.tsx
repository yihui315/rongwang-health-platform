import Link from "next/link";
import { notFound } from "next/navigation";
import { getConsultationLogDetail } from "@/lib/data/consultations";

function JsonCard({
  title,
  description,
  value,
}: {
  title: string;
  description?: string;
  value: unknown;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      )}
      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {JSON.stringify(value ?? null, null, 2)}
      </pre>
    </div>
  );
}

export default async function AdminAiLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getConsultationLogDetail(id);

  if (!row) {
    notFound();
  }

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">AI Log Detail</span>
            <h1 className="mt-4 break-all text-slate-900">{row.id}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Read-only detail view for the structured AI consultation log, including parse status, fallback metadata, and the stored request snapshot.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/consultations" className="btn-secondary">
              Consultations
            </Link>
            <Link href="/admin/ai-logs" className="btn-secondary">
              Back to AI logs
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Provider
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {row.aiProvider ?? "legacy"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Model
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {row.aiModel ?? "-"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Prompt Version
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {row.promptVersion ?? "-"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Status
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {row.aiStatus ?? "legacy"}
              {row.fallbackUsed ? " · fallback" : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Consultation summary</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {row.result?.summary ?? "No structured result available"}
                </h2>
              </div>
              <span className="badge-slate">{row.riskLevel}</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Symptoms</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.symptoms.length > 0 ? (
                    row.symptoms.map((symptom) => (
                      <span key={symptom} className="badge-slate">
                        {symptom}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No symptoms stored.</span>
                  )}
                </div>
              </div>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">Created:</span>{" "}
                  {row.createdAt || "no timestamp"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Source:</span>{" "}
                  {row.source ?? "unknown-source"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Age:</span>{" "}
                  {row.age ?? "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Goal:</span>{" "}
                  {row.goal ?? "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Recommendations:</span>{" "}
                  {row.recommendations.length}
                </p>
              </div>
            </div>

            {row.aiErrorMessage && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                <p className="text-sm font-medium text-rose-800">Error message</p>
                <p className="mt-2 text-sm leading-6 text-rose-700">
                  {row.aiErrorMessage}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Request metadata</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-medium text-slate-900">IP hash:</span>{" "}
                {row.requestMeta?.ipHash ?? "-"}
              </p>
              <p>
                <span className="font-medium text-slate-900">User agent:</span>{" "}
                {row.requestMeta?.userAgent ?? "-"}
              </p>
            </div>

            {row.safety && (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-900">Safety snapshot</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>Risk level: {row.safety.riskLevel}</li>
                  <li>Commerce allowed: {row.safety.commerceAllowed ? "yes" : "no"}</li>
                  <li>Red flags: {row.safety.redFlags.length}</li>
                  <li>Caution flags: {row.safety.cautionFlags.length}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <JsonCard
            title="AI log payload"
            description="Structured log generated by the new provider / parser pipeline."
            value={row.aiLog}
          />
          <JsonCard
            title="Profile snapshot"
            description="Validated health profile stored with the consultation."
            value={row.profile}
          />
          <JsonCard
            title="Structured result"
            description="Final AI result after safety post-processing."
            value={row.result}
          />
          <JsonCard
            title="Recommendation snapshot"
            description="Rule-based recommendations attached to this consultation."
            value={row.recommendations}
          />
          <JsonCard
            title="Raw response"
            description="Raw AI payload preserved for parse / fallback debugging."
            value={row.rawResponse}
          />
          <JsonCard
            title="Safety snapshot"
            description="Safety assessment stored alongside the consultation."
            value={row.safety}
          />
        </div>
      </section>
    </main>
  );
}
