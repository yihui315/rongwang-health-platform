import Link from "next/link";
import { listConsultations } from "@/lib/data/consultations";

interface AdminConsultationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminConsultationsPage({ searchParams }: AdminConsultationsPageProps) {
  const query = await searchParams;
  const riskLevel = readSearchParam(query.riskLevel);
  const symptom = readSearchParam(query.symptom);
  const source = readSearchParam(query.source);
  const hasClickValue = readSearchParam(query.hasClick);
  const rows = await listConsultations({
    riskLevel: riskLevel || undefined,
    symptom: symptom || undefined,
    source: source || undefined,
    hasClick: hasClickValue === "true" ? true : hasClickValue === "false" ? false : undefined,
  });

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Consultations</span>
            <h1 className="mt-4 text-slate-900">Consultation Records</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Records now read through the consultation data layer, preferring Prisma and falling back to Supabase during migration.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <form className="mt-8 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
          <label className="text-xs font-medium text-slate-500">
            Risk
            <select name="riskLevel" defaultValue={riskLevel ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="">All</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">
            Symptom
            <input name="symptom" defaultValue={symptom ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700" placeholder="疲劳" />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Source
            <input name="source" defaultValue={source ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700" placeholder="ai-consult" />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Clicked
            <select name="hasClick" defaultValue={hasClickValue ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="">All</option>
              <option value="true">Has click</option>
              <option value="false">No click</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Filter</button>
            <Link href="/admin/consultations" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Reset</Link>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500">
              No consultation records are currently available.
            </div>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-teal-700">{row.id}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Age: {row.age ?? "-"}, Goal: {row.goal ?? "-"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Provider: {row.aiProvider ?? "legacy"}, Model: {row.aiModel ?? "-"}, Prompt: {row.promptVersion ?? "-"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      AI status: {row.aiStatus ?? "legacy"} | Fallback: {row.fallbackUsed ? "yes" : "no"}
                    </p>
                    {row.aiStatus && (
                      <Link href={`/admin/ai-logs/${row.id}`} className="mt-3 inline-flex text-sm font-medium text-teal-700 hover:text-teal-800">
                        Open AI log detail
                      </Link>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.symptoms.map((symptom) => (
                        <span key={symptom} className="badge-slate">{symptom}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge-slate">{row.riskLevel}</span>
                    <p className="mt-3 text-sm text-slate-500">{row.createdAt || "no timestamp"}</p>
                    <p className="mt-2 text-sm text-slate-500">Clicks: {row.clickCount ?? 0}</p>
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
