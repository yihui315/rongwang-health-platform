import Link from "next/link";
import { listOutboundQueue, type OutboundQueueEntryView } from "@/lib/marketing/outbound-queue";

function countByStatus(queue: OutboundQueueEntryView[], status: OutboundQueueEntryView["status"]) {
  return queue.filter((entry) => entry.status === status).length;
}

function formatPayloadTitle(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "Untitled outbound payload";
  }

  const maybeTitle = (payload as { title?: unknown }).title;
  return typeof maybeTitle === "string" && maybeTitle.trim()
    ? maybeTitle
    : "Untitled outbound payload";
}

function formatPayloadBrief(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeBrief = (payload as { brief?: unknown }).brief;
  return typeof maybeBrief === "string" && maybeBrief.trim() ? maybeBrief : null;
}

function formatBlockedReasons(reasons: string[]) {
  return reasons.length > 0 ? reasons.join(" / ") : "No active blocker";
}

function getReviewHistory(metadata: OutboundQueueEntryView["metadata"]) {
  const history = metadata.reviewHistory;
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      action: typeof item.action === "string" ? item.action : "review",
      actor: typeof item.actor === "string" ? item.actor : "admin",
      note: typeof item.note === "string" ? item.note : "",
      at: typeof item.at === "string" ? item.at : "",
      previousStatus: typeof item.previousStatus === "string" ? item.previousStatus : "",
      nextStatus: typeof item.nextStatus === "string" ? item.nextStatus : "",
    }));
}

export default async function AdminOutboundQueuePage() {
  const queue = await listOutboundQueue();
  const blockedCount = countByStatus(queue, "blocked");
  const readyCount = countByStatus(queue, "ready");
  const manualReviewCount = queue.filter((entry) =>
    entry.blockedReasons.includes("manual_send_review_required"),
  ).length;
  const automatedSendEnabled = process.env.ALLOW_AUTOMATED_MARKETING_SEND === "true";

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Outbound Queue</span>
            <h1 className="mt-4 text-slate-900">Manual Send Review</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Read-only audit surface for planned marketing sends. Entries stay blocked until the campaign plan,
              compliance result, provider configuration, and human review gates are all satisfied.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Manual review required</p>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-amber-800">
            This page does not send, approve, or mark messages as delivered. It exists so operators can inspect
            blocked outbound sends before a separate, reviewed workflow is considered. ALLOW_AUTOMATED_MARKETING_SEND
            is currently {automatedSendEnabled ? "true" : "false"}.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard title="Total entries" value={queue.length} note="Loaded from outbound queue storage" />
          <MetricCard title="Blocked" value={blockedCount} note="Includes compliance and send-gate blockers" />
          <MetricCard title="Ready" value={readyCount} note="Still requires a separate reviewed send workflow" />
          <MetricCard title="Manual review" value={manualReviewCount} note="manual_send_review_required" />
        </div>

        <div className="mt-8 space-y-4">
          {queue.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500">
              No outbound queue entries are available yet. Generate a marketing automation plan first; the default
              path creates blocked draft sends for manual inspection.
            </div>
          ) : (
            queue.map((entry) => <OutboundQueueEntryCard key={entry.id} entry={entry} />)
          )}
        </div>
      </section>
    </main>
  );
}

function OutboundQueueEntryCard({ entry }: { entry: OutboundQueueEntryView }) {
  const reviewHistory = getReviewHistory(entry.metadata);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-slate">{entry.channel}</span>
            <span className={entry.status === "blocked" ? "badge-orange" : "badge-teal"}>
              {entry.status}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">
            {formatPayloadTitle(entry.payload)}
          </h2>
          {formatPayloadBrief(entry.payload) ? (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              {formatPayloadBrief(entry.payload)}
            </p>
          ) : null}
          <p className="mt-3 break-all text-sm text-slate-500">
            Destination: {entry.destination ?? "not set"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Marketing plan: {entry.marketingPlanId} | Lead: {entry.leadId ?? "-"}
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>{entry.createdAt}</p>
          <p className="mt-2">Updated: {entry.updatedAt}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-800">Blocked reasons</p>
          <p className="mt-2 text-sm leading-7 text-rose-700">
            {formatBlockedReasons(entry.blockedReasons)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Gate snapshot</p>
          <dl className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <GateTerm label="Plan" value={entry.gateSnapshot.marketingPlanStatus} />
            <GateTerm
              label="Compliance"
              value={entry.gateSnapshot.complianceApproved ? "approved" : "not approved"}
            />
            <GateTerm
              label="Automated send"
              value={entry.gateSnapshot.automatedMarketingEnabled ? "enabled" : "automated_marketing_disabled"}
            />
            <GateTerm
              label="Provider"
              value={entry.gateSnapshot.channelProviderConfigured ? "configured" : "channel_provider_not_configured"}
            />
          </dl>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Review history</p>
        {reviewHistory.length === 0 ? (
          <p className="mt-2 text-sm leading-7 text-slate-500">
            No manual review decision has been recorded for this queue entry.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {reviewHistory.map((review, index) => (
              <div
                key={`${entry.id}-review-${index}`}
                className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="badge-slate">{review.action}</span>
                  <span className="text-slate-500">{review.actor}</span>
                  <span className="text-slate-400">{review.at}</span>
                </div>
                {review.previousStatus || review.nextStatus ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {review.previousStatus || "-"} to {review.nextStatus || "-"}
                  </p>
                ) : null}
                {review.note ? (
                  <p className="mt-2 text-sm leading-7 text-slate-600">{review.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
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

function GateTerm({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
