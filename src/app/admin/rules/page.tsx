import Link from "next/link";
import { RuleEditor } from "@/components/admin/RuleEditor";
import { listProducts } from "@/lib/data/products";
import { listRecommendationRules } from "@/lib/data/recommendation-rules";
import { getRecommendationRulePreviews, solutionPlanMap, tierWeight } from "@/lib/health/recommendations";

export default async function AdminRulesPage() {
  const [products, rules] = await Promise.all([
    listProducts(),
    listRecommendationRules(true),
  ]);
  const previews = getRecommendationRulePreviews(products, 5);

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Rules</span>
            <h1 className="mt-4 text-slate-900">Recommendation Rules</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              This operations view exposes the current rule engine: AI decides risk level and solution direction, then rules map that direction to product candidates with deterministic weights.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Rule types
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {Object.keys(solutionPlanMap).length}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Includes the general fallback path used when AI does not identify a stronger direction.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Rule records
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {rules.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Prisma rules are preferred; static fallback rules are shown if the database is unavailable.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Active products
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {products.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Product candidates are read through the migration-safe product data layer.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Commerce guardrail
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              urgent = block
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              High-risk users are not shown product recommendations or purchase CTAs.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Tier weights
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(tierWeight).map(([tier, weight]) => (
                <span key={tier} className="badge-slate">
                  {tier}: {weight}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Base plan matching is scored first, then tier and profile-specific boosts refine ranking.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-950 px-6 py-6 text-white">
          <h2 className="text-xl font-semibold">Current pipeline</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-white">1. AI decides direction</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                The consultation result returns risk level and recommended solution type only.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-white">2. Rules map plans</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Each solution type maps to one or more product plans such as sleep, fatigue, liver, immune, or stress.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-white">3. Candidates are ranked</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Tier weight and lifestyle boosts raise the best-fit products, then the top entries are exposed to the user.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Stored / fallback rule records
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                This is the operational rule source consumed by the DB-first recommendation engine. Rules can be reordered and toggled in the database without changing AI prompts.
              </p>
            </div>
            <span className="badge-slate">
              {rules.filter((rule) => rule.active).length} active
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[0.7fr_1fr_1.4fr_0.7fr_0.5fr_1.2fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Priority</span>
              <span>Name</span>
              <span>Condition</span>
              <span>Products</span>
              <span>Status</span>
              <span>Edit</span>
            </div>
            {rules.map((rule) => (
              <div
                key={rule.id ?? rule.name}
                className="grid grid-cols-[0.7fr_1fr_1.4fr_0.7fr_0.5fr_1.2fr] gap-4 border-t border-slate-200 px-4 py-4 text-sm text-slate-600"
              >
                <span className="font-medium text-slate-900">{rule.priority}</span>
                <span>
                  <span className="block font-medium text-slate-900">{rule.name}</span>
                  {rule.note ? <span className="mt-1 block text-xs leading-5 text-slate-500">{rule.note}</span> : null}
                </span>
                <span className="flex flex-wrap gap-2">
                  {(rule.condition.solutionTypes ?? ["any"]).map((item) => (
                    <span key={item} className="badge-slate">{item}</span>
                  ))}
                  {(rule.condition.riskLevels ?? []).map((item) => (
                    <span key={item} className="badge-slate">{item}</span>
                  ))}
                </span>
                <span>{rule.productIds.length}</span>
                <span className={rule.active ? "text-teal-700" : "text-slate-400"}>
                  {rule.active ? "active" : "paused"}
                </span>
                <RuleEditor rule={rule} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {previews.map((preview) => (
            <section
              key={preview.solutionType}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-teal-700">
                    {preview.solutionType}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {preview.label}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                    Route target:{" "}
                    <span className="font-medium text-slate-700">
                      /solutions/{preview.solutionSlug}
                    </span>
                    {preview.solutionType === "general"
                      ? " · general uses the fatigue route as a safe content fallback."
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/solutions/${preview.solutionSlug}`}
                    className="btn-secondary"
                  >
                    View solution page
                  </Link>
                  <Link
                    href={`/assessment/${preview.solutionSlug}`}
                    className="btn-secondary"
                  >
                    View assessment page
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <p className="text-sm font-medium text-slate-900">
                      Target plans
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {preview.targetPlans.map((plan) => (
                        <span key={plan} className="badge-slate">
                          {plan}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <p className="text-sm font-medium text-slate-900">
                      Preview profile
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {preview.previewProfileSummary.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <p className="text-sm font-medium text-slate-900">
                      Rule notes
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {preview.notes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Candidate ranking preview
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Sorted with the current deterministic scoring logic.
                      </p>
                    </div>
                    <span className="badge-slate">
                      {preview.candidates.length} candidates shown
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {preview.candidates.map((candidate, index) => (
                      <div
                        key={`${preview.solutionType}-${candidate.productSlug}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="max-w-2xl">
                            <p className="text-sm font-medium text-teal-700">
                              #{index + 1} · {candidate.brand}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">
                              {candidate.name}
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {candidate.plans.map((plan) => (
                                <span
                                  key={`${candidate.productSlug}-${plan}`}
                                  className="badge-slate"
                                >
                                  {plan}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="min-w-[160px] text-right">
                            <p className="text-sm text-slate-500">
                              Score / Tier
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                              {candidate.score}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              {candidate.tier} · HK${candidate.memberPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
