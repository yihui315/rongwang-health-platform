import Link from "next/link";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthRequired,
  isAdminTokenValid,
} from "@/lib/auth/admin";
import { listAssessmentReportsForAdmin } from "@/lib/data/assessment-reports";

function riskBadgeClass(riskLevel: string) {
  if (riskLevel === "urgent" || riskLevel === "high") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }
  if (riskLevel === "medium") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

export default async function AdminReportsPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const requiresAuth = isAdminAuthRequired();
  const authorized = !requiresAuth || isAdminTokenValid(adminToken);

  if (!authorized) {
    return (
      <main className="bg-[var(--bg)]">
        <section className="section-container py-16">
          <span className="badge-teal">Assessment Reports</span>
          <h1 className="mt-4 text-slate-900">Admin login required</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Saved report audit data is only available after a valid admin session.
          </p>
          <Link href="/admin/login" className="mt-6 inline-flex btn-primary">
            Open admin login
          </Link>
        </section>
      </main>
    );
  }

  const reports = await listAssessmentReportsForAdmin();

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Assessment Reports</span>
            <h1 className="mt-4 text-slate-900">Saved Report Audit</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Review saved AI reports with masked account metadata. Raw WeChat identifiers and identity hashes stay out of the UI.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Saved reports</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{reports.length}</p>
        </div>

        <div className="mt-8 space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500">
              No saved assessment reports are available yet.
            </div>
          ) : (
            reports.map((report) => (
              <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-teal-700">{report.id}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{report.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      User: {report.user.emailMasked ?? report.user.displayName ?? report.user.id}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.user.identityProviders.map((provider) => (
                        <span key={provider} className="badge-slate">
                          {provider}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${riskBadgeClass(report.riskLevel)}`}>
                      {report.riskLevel}
                    </span>
                    <p className="mt-3 text-sm text-slate-500">{report.createdAt}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Direction: {report.recommendedSolutionType ?? "-"}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
