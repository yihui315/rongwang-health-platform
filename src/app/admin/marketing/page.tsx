import Link from "next/link";
import { summarizeAnalyticsEvents } from "@/lib/data/analytics-events";
import type { PddClickSummary } from "@/lib/data/pdd-clicks";
import { getFeatureFlagSnapshot } from "@/lib/feature-flags";
import { buildMarketingAutopilotRun } from "@/lib/marketing/autopilot";
import { buildMarketingCampaignPlan } from "@/lib/marketing/automation";
import { getGeoFlowAutomationStatus } from "@/lib/marketing/geoflow";
import { getWechatReadinessStatus } from "@/lib/wechat/config";
import { getPddLinkReadiness } from "@/lib/wechat/pdd-link";

const emptyPddSummary: PddClickSummary = {
  total: 0,
  bySource: [],
  bySolution: [],
  recent: [],
};

export default function AdminMarketingPage() {
  const flags = getFeatureFlagSnapshot();
  const geoFlow = getGeoFlowAutomationStatus();
  const wechat = getWechatReadinessStatus();
  const pddRedirect = getPddLinkReadiness();
  const samplePlan = buildMarketingCampaignPlan({
    objective: "assessment_conversion",
    audience: "关注睡眠、疲劳和女性健康管理的内容用户",
    solution: "female-health",
    keyword: "女性健康支持方案",
    campaignSlug: "female-health-automation",
    channels: ["seo_article", "landing_page", "xiaohongshu", "wechat", "email"],
  });
  const wechatPublication = samplePlan.assets.flatMap((asset) =>
    asset.wechatArticle ? [asset.wechatArticle] : [],
  );
  const autopilot = buildMarketingAutopilotRun({
    request: {
      objective: "assessment_conversion",
      audience: "已经进入内容页但还没有完成 AI 评估的用户",
      solution: "female-health",
      keyword: "女性健康支持方案",
      campaignSlug: "female-health-autopilot",
      channels: ["seo_article", "landing_page", "xiaohongshu", "email"],
    },
    analytics: summarizeAnalyticsEvents([]),
    pddClicks: emptyPddSummary,
    geoFlow,
    executeRequested: false,
    adminAuthorized: false,
  });

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Marketing Automation</span>
            <h1 className="mt-4 text-slate-900">AI 自动化市场营销中枢</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              把 GEOFlow 内容生产、AI-first CTA、UTM 归因、漏斗指标、PDD 点击和合规审核串成一个自动驾驶工作流。默认只生成 dry-run 计划；只有管理员授权、执行开关和 GEOFlow 发布条件同时满足时才允许外部写入。
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <MetricCard
            title="Automation"
            value={flags.marketingAutomation ? "On" : "Off"}
            note="FEATURE_MARKETING_AUTOMATION"
          />
          <MetricCard
            title="Autopilot"
            value={flags.marketingAutopilot ? "On" : "Off"}
            note="FEATURE_MARKETING_AUTOPILOT"
          />
          <MetricCard
            title="GEOFlow"
            value={geoFlow.configured ? "Configured" : "Fallback"}
            note={geoFlow.canPublish ? "Ready for reviewed publishing" : "Dry-run task drafts only"}
          />
          <MetricCard
            title="Primary CTA"
            value="AI consult"
            note="All assets route to assessment first"
          />
          <MetricCard
            title="WeChat"
            value={wechat.officialAccount.canUploadDraft ? "Draft ready" : "Dry-run"}
            note={wechat.miniProgram.configured ? "Mini Program configured" : "Mini Program pending"}
          />
          <MetricCard
            title="PDD Redirect"
            value={pddRedirect.mode}
            note={pddRedirect.configured ? "PDD guided mode ready" : "Fallback required"}
          />
        </div>

        <div id="wechat-operations" className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-800">WeChat Operations</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Official Account draft flow stays review-first
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                WeChat content is generated as Markdown, previewed through md2wechat, then reviewed manually before optional draft upload. Mini Program commerce and WeChat Pay stay separated from article publishing.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Read-only status API: <code className="rounded bg-white px-1">GET /api/wechat/status</code>
              </p>
              <p className="mt-2 text-sm text-slate-500">
                wechatPublication decisions: {wechatPublication.length}; auto-publish remains gated by WECHAT_AUTO_PUBLISH and compliance review.
              </p>
            </div>
            <Link href="/admin" className="btn-secondary">
              Admin home
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <StatusPanel
              title="Official Account"
              value={wechat.officialAccount.canUploadDraft ? "Draft upload ready" : "Preview / dry-run only"}
              missing={wechat.officialAccount.missing}
            />
            <StatusPanel
              title="Mini Program"
              value={wechat.miniProgram.configured ? "Configured" : "Pending credentials"}
              missing={wechat.miniProgram.missing}
            />
            <StatusPanel
              title="PDD Redirect"
              value={pddRedirect.configured ? `Mode: ${pddRedirect.mode}` : "Fallback required"}
              missing={pddRedirect.missing}
            />
            <StatusPanel
              title="WeChat Pay"
              value={wechat.pay.configured ? "Configured" : "Payment disabled"}
              missing={wechat.pay.missing}
            />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-teal-100 bg-teal-50/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-800">AI Autopilot Snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                当前建议状态：{autopilot.status}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                自动驾驶会读取评估开始率、完成率、推荐点击率、PDD 跳转率和 GEOFlow 配置状态，然后生成下一批 campaign、实验和工程/内容动作。
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              <p>Mode: {autopilot.mode}</p>
              <p>Focus: {autopilot.focusSolution ?? "general"}</p>
              <p>Next run: {autopilot.nextRun.recommendedAfterHours}h</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {autopilot.actions.slice(0, 3).map((action) => (
              <div key={action.kind} className="rounded-2xl border border-teal-100 bg-white p-4">
                <span className="badge-slate">{action.priority}</span>
                <p className="mt-3 text-sm font-semibold text-slate-900">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{action.rationale}</p>
              </div>
            ))}
            {autopilot.actions.length === 0 ? (
              <div className="rounded-2xl border border-teal-100 bg-white p-4 text-sm leading-6 text-slate-500">
                当前没有阻塞动作，可以继续生成活动草稿并人工审核。
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Growth Playbooks</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                来自 Marketing for Founders 的增长方法已经转成 Rongwang 可执行策略库。系统会根据漏斗信号选择打法，但所有输出仍保持草稿、AI 评估优先和合规审核。
              </p>
            </div>
            <span className="badge-slate">{autopilot.playbooks.length} recommended</span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {autopilot.playbooks.map((entry) => (
              <div key={entry.playbook.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="badge-teal">{entry.priority}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {entry.playbook.funnelStage}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{entry.playbook.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{entry.reason}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Source: {entry.playbook.sourcePrinciple}
                </p>
                <div className="mt-4 space-y-2">
                  {entry.assets.slice(0, 2).map((asset) => (
                    <div key={`${entry.playbook.id}-${asset.title}`} className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600">
                      {asset.title} · {asset.status}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InsightList
              title="Free tool ideas"
              items={autopilot.freeToolIdeas.map((idea) => `${idea.title} → ${idea.href}`)}
              empty="当前未推荐新的免费工具。"
            />
            <InsightList
              title="Lifecycle flows"
              items={autopilot.lifecycleFlows.map((flow) => `${flow.trigger} → ${flow.metric}`)}
              empty="当前未推荐新的邮件流。"
            />
            <InsightList
              title="Content opportunities"
              items={autopilot.contentOpportunities.map((item) => `${item.title} → ${item.primaryCta}`)}
              empty="当前未推荐新的内容机会。"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">示例活动计划</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  自动化 API 返回同一套结构，运营可以先审稿、看归因参数，再决定是否进入 GEOFlow 发布流程。
                </p>
              </div>
              <span className="badge-slate">{samplePlan.campaignSlug}</span>
            </div>

            <div className="mt-5 space-y-3">
              {samplePlan.assets.map((asset) => (
                <div key={asset.channel} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{asset.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{asset.brief}</p>
                    </div>
                    <span className={asset.compliance.approved ? "badge-teal" : "badge-slate"}>
                      {asset.compliance.approved ? "合规通过" : "需要修改"}
                    </span>
                  </div>
                  <p className="mt-3 break-all text-xs leading-5 text-slate-500">{asset.href}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">GEOFlow 对接状态</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <StatusRow label="API credentials" value={geoFlow.configured ? "已配置" : "未配置"} />
                <StatusRow label="Default title library" value={geoFlow.requiredDefaults.titleLibraryId ? String(geoFlow.requiredDefaults.titleLibraryId) : "缺失"} />
                <StatusRow label="Default prompt" value={geoFlow.requiredDefaults.promptId ? String(geoFlow.requiredDefaults.promptId) : "缺失"} />
                <StatusRow label="Default model" value={geoFlow.requiredDefaults.aiModelId ? String(geoFlow.requiredDefaults.aiModelId) : "缺失"} />
                <StatusRow label="Auto publish" value={geoFlow.autoPublishEnabled ? "已开启" : "关闭，安全 dry-run"} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">自动驾驶 API</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  <code className="rounded bg-slate-100 px-1">GET /api/marketing/autopilot</code>
                  ：查看能力、开关和 GEOFlow 状态。
                </p>
                <p>
                  <code className="rounded bg-slate-100 px-1">POST /api/marketing/autopilot</code>
                  ：管理员授权后，根据站内信号生成下一批活动、实验和 GEOFlow 草稿。
                </p>
                <p>
                  <code className="rounded bg-slate-100 px-1">execute=true</code>
                  ：需要管理员授权，并且必须开启 MARKETING_AUTOPILOT_EXECUTE。
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">上线操作顺序</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>1. 在 GEOFlow 后台配置模型、标题库、Prompt 和分类。</li>
                <li>2. 把对应 ID 写入生产环境变量。</li>
                <li>3. 调用 autopilot 生成 dry-run，检查 CTA、UTM 和合规结果。</li>
                <li>4. 审核通过后，再打开自动发布和执行开关。</li>
              </ol>
            </div>
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

function InsightList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.slice(0, 4).map((item) => (
            <p key={item} className="text-xs leading-5 text-slate-600">
              {item}
            </p>
          ))
        ) : (
          <p className="text-xs leading-5 text-slate-500">{empty}</p>
        )}
      </div>
    </div>
  );
}

function StatusPanel({ title, value, missing }: { title: string; value: string; missing: string[] }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{value}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {missing.length > 0 ? `Missing: ${missing.join(", ")}` : "No required values missing."}
      </p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <span>{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
