'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { DraftLayoutPreviewGroup } from '@/src/components/text/DraftLayoutPreview';

type HealthReportRow = {
  id: string;
  leadId: string;
  name: string;
  contact: string;
  scenarioLabel: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'generated' | 'pending_manual_review' | 'approved' | 'rejected';
  overallScore: number;
  manualReviewRequired: boolean;
  redFlags: string[];
  reviewNotes: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type MarketingPlanRow = {
  id: string;
  reportId: string;
  leadId: string;
  status: 'pending_manual_review' | 'approved' | 'rejected' | 'generated';
  automationLevel: 'draft_only';
  audience: {
    segment: string;
    riskLevel: string;
    scenarioSlug: string;
  };
  steps: Array<{
    dayOffset: number;
    channel: string;
    objective: string;
    draftCopy: string;
    status: 'draft';
  }>;
  complianceSummary: {
    requiredManualReview: boolean;
    autoSendBlocked: boolean;
    riskSignals: string[];
    contentWarnings: string[];
  };
  manualFollowUp: {
    owner: 'health_advisor' | 'compliance_reviewer';
    nextAction: string;
    approvedAction: string;
    rejectedAction: string;
  };
  guardrails: string[];
  workflow: {
    trigger: string;
    reviewGate: string;
    stopConditions: string[];
  };
  reviewNotes: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
  reviewHistory: Array<{
    status: 'pending_manual_review' | 'approved' | 'rejected';
    notes: string | null;
    reviewer: string;
    reviewedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type LeadConsent = {
  privacyAccepted: boolean;
  termsAccepted: boolean;
  version: string;
  page: string;
  acceptedAt: string;
};

type WorkspaceData = {
  ok: boolean;
  leads: Array<{
    id: string;
    contact: string;
    source: string;
    scenarioSlug: string | null;
    consent?: LeadConsent;
    createdAt: string;
  }>;
  reports: HealthReportRow[];
  plans: MarketingPlanRow[];
};

type ReviewTab = 'reports' | 'plans';
type ReviewSourceFilter = 'all' | 'smoke_only' | 'hide_smoke';

const reviewDraftFonts = {
  reportCopy: '700 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  marketingCopy: '700 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

const readinessItems = [
  {
    title: '微信登录',
    status: '未开通',
    tone: 'blocked',
    detail: '当前仅支持管理员令牌登录；客户侧微信 OAuth 仍需申请主体、回调域名和隐私授权。',
  },
  {
    title: '微信商城',
    status: '人工确认',
    tone: 'manual',
    detail: '官网商城只做商品展示和咨询承接，购买方式由顾问人工确认，不提供站内支付。',
  },
  {
    title: '小程序',
    status: '未开通',
    tone: 'blocked',
    detail: '小程序商城待开通；上线前需补齐备案、类目资质、客服入口、退换货与跨境提示。',
  },
  {
    title: '客户系统',
    status: '人工审核',
    tone: 'manual',
    detail: '线索、健康报告、同意记录和营销草稿已入工作台；继续阻断自动发送，必须人工审核。',
  },
] as const;

const sourceFilterOptions: Array<{ value: ReviewSourceFilter; label: string }> = [
  { value: 'all', label: '全部数据' },
  { value: 'smoke_only', label: '仅看 Smoke' },
  { value: 'hide_smoke', label: '隐藏 Smoke' },
];

function statusBadge(status: string): string {
  if (status === 'approved') return '已通过';
  if (status === 'rejected') return '已驳回';
  if (status === 'pending_manual_review') return '待人工审核';
  return '已生成';
}

function ownerLabel(owner: MarketingPlanRow['manualFollowUp']['owner']): string {
  if (owner === 'compliance_reviewer') return '合规审核';
  return '健康顾问';
}

function consentLabel(value: boolean | undefined): string {
  return value ? '已同意' : '未记录';
}

function isSmokeLead(lead: { source: string } | undefined): boolean {
  return lead?.source === 'customer_journey_smoke';
}

function matchesSourceFilter(lead: { source: string } | undefined, sourceFilter: ReviewSourceFilter): boolean {
  const isSmoke = isSmokeLead(lead);
  if (sourceFilter === 'smoke_only') return isSmoke;
  if (sourceFilter === 'hide_smoke') return !isSmoke;
  return true;
}

export default function WorkspaceHomePage() {
  const router = useRouter();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReviewTab>('reports');
  const [sourceFilter, setSourceFilter] = useState<ReviewSourceFilter>('all');
  const [actionMessage, setActionMessage] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function loadData() {
    const [reportsRes, plansRes] = await Promise.all([
      fetch('/api/health-report', { cache: 'no-store' }),
      fetch('/api/marketing/plan', { cache: 'no-store' }),
    ]);
    const [reportsData, plansData] = await Promise.all([reportsRes.json(), plansRes.json()]);
    setData({
      ok: true,
      leads: reportsData.leads || [],
      reports: reportsData.reports || [],
      plans: plansData.plans || [],
    });
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      try {
        await loadData();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const reports = data?.reports ?? [];
    const plans = data?.plans ?? [];
    return {
      leads: data?.leads.length ?? 0,
      reports: reports.length,
      pendingReports: reports.filter((item) => item.status === 'pending_manual_review').length,
      approvedReports: reports.filter((item) => item.status === 'approved').length,
      plans: plans.length,
      pendingPlans: plans.filter((item) => item.status === 'pending_manual_review').length,
      approvedPlans: plans.filter((item) => item.status === 'approved').length,
    };
  }, [data]);

  const consentByLeadId = useMemo(() => {
    return new Map((data?.leads ?? []).map((lead) => [lead.id, lead.consent]));
  }, [data]);

  const leadById = useMemo(() => {
    return new Map((data?.leads ?? []).map((lead) => [lead.id, lead]));
  }, [data]);

  async function handleLogout() {
    setBusyKey('auth-logout');
    setActionMessage('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('退出登录失败');
      router.push('/login');
      router.refresh();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : '退出登录失败');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReportReview(reportId: string, status: 'approved' | 'rejected') {
    setBusyKey(`report-${reportId}-${status}`);
    setActionMessage('');
    try {
      const response = await fetch('/api/health-report', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          status,
          reviewNotes: status === 'approved' ? '人工审核通过，可进入顾问跟进。' : '人工审核驳回，请重新确认风险与内容。',
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || '报告更新失败');
      setActionMessage('健康报告状态已更新。');
      await loadData();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : '报告更新失败');
    } finally {
      setBusyKey(null);
    }
  }

  async function handlePlanReview(planId: string, status: 'pending_manual_review' | 'approved' | 'rejected') {
    setBusyKey(`plan-${planId}-${status}`);
    setActionMessage('');
    const reviewNotesByStatus = {
      pending_manual_review: '运营已调整营销草稿，重新提交人工审核。',
      approved: '营销草稿审核通过，可进入人工跟进。',
      rejected: '营销草稿驳回，请调整内容后再审。',
    };

    try {
      const response = await fetch('/api/marketing/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          status,
          reviewNotes: reviewNotesByStatus[status],
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || '营销计划更新失败');
      setActionMessage('营销草稿状态已更新。');
      await loadData();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : '营销计划更新失败');
    } finally {
      setBusyKey(null);
    }
  }

  const visibleReports = (data?.reports ?? []).filter((report) => {
    return matchesSourceFilter(leadById.get(report.leadId), sourceFilter);
  });
  const visiblePlans = (data?.plans ?? []).filter((plan) => {
    return matchesSourceFilter(leadById.get(plan.leadId), sourceFilter);
  });

  return (
    <main className="workspace-shell">
      <section className="workspace-hero">
        <div>
          <p className="workspace-eyebrow">Workspace</p>
          <h1>运营审核工作台</h1>
          <p>
            这里把健康报告、营销草稿和审核状态放在同一个地方。所有操作都是人工审核，不包含自动发送。
          </p>
        </div>
        <div className="workspace-actions">
          <Link href="/workspace/import">商品导入</Link>
          <Link href="/workspace/generate">内容生成</Link>
          <Link href="/ai-consult">AI 评估入口</Link>
          <button type="button" onClick={handleLogout} disabled={busyKey !== null}>
            {busyKey === 'auth-logout' ? '退出中...' : '退出登录'}
          </button>
        </div>
      </section>

      <section className="workspace-stats">
        {[
          ['线索', summary.leads],
          ['报告', summary.reports],
          ['待审报告', summary.pendingReports],
          ['已通过报告', summary.approvedReports],
          ['营销草稿', summary.plans],
          ['待审草稿', summary.pendingPlans],
        ].map(([label, value]) => (
          <article key={label as string} className="workspace-stat-card">
            <span>{label}</span>
            <strong>{loading ? '…' : value}</strong>
          </article>
        ))}
      </section>

      <section className="workspace-readiness" aria-label="上线准备核对">
        <div className="workspace-readiness-head">
          <div>
            <p className="workspace-eyebrow">Launch Readiness</p>
            <h2>上线准备核对</h2>
          </div>
          <strong>阻断自动发送 · 保留人工审核</strong>
        </div>
        <div className="workspace-readiness-grid">
          {readinessItems.map((item) => (
            <article key={item.title} className="workspace-readiness-card">
              <span className={`workspace-readiness-status workspace-readiness-status-${item.tone}`}>{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-tabs">
        <button className={activeTab === 'reports' ? 'is-active' : ''} onClick={() => setActiveTab('reports')}>
          健康报告审核
        </button>
        <button className={activeTab === 'plans' ? 'is-active' : ''} onClick={() => setActiveTab('plans')}>
          营销草稿审核
        </button>
      </section>

      {actionMessage ? <p className="workspace-message">{actionMessage}</p> : null}

      {activeTab === 'reports' ? (
        <section className="workspace-panel">
          <div className="workspace-report-filter-bar" aria-label="审核数据来源筛选">
            {sourceFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={sourceFilter === option.value}
                onClick={() => setSourceFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {visibleReports.map((report) => {
            const consent = consentByLeadId.get(report.leadId);
            const lead = leadById.get(report.leadId);
            const smokeLead = isSmokeLead(lead);
            return (
              <article key={report.id} className="workspace-item">
                <div className="workspace-item-head">
                  <div>
                    <h2>
                      {report.name}
                      {smokeLead ? <span className="workspace-source-badge workspace-source-badge-smoke">客户旅程 Smoke</span> : null}
                    </h2>
                    <p>
                      {report.scenarioLabel} · 风险 {report.riskLevel} · 风险关注指数 {report.overallScore}
                      （分值越高越需要先人工复核）
                    </p>
                  </div>
                  <strong>{statusBadge(report.status)}</strong>
                </div>
                <p className="workspace-meta">
                  {report.contact} · 来源：{lead?.source || '未记录'} · {new Date(report.createdAt).toLocaleString()}
                </p>
                <section className="workspace-review-block">
                  <h3>同意记录</h3>
                  <p className="workspace-notes">
                    隐私政策：{consentLabel(consent?.privacyAccepted)} · 服务条款：{consentLabel(consent?.termsAccepted)}
                  </p>
                  <p className="workspace-notes">
                    版本：{consent?.version || '未记录'} · 页面：{consent?.page || '未记录'}
                  </p>
                  <p className="workspace-notes">
                    时间：{consent?.acceptedAt ? new Date(consent.acceptedAt).toLocaleString() : '未记录'}
                  </p>
                </section>
                <DraftLayoutPreviewGroup
                  title="健康报告布局预检"
                  description="预估风险提示和审核备注在移动端审核卡里的行数；通过前仍需人工确认风险边界。"
                  items={[
                    ...report.redFlags.map((flag, index) => ({
                      id: `${report.id}-flag-${index}`,
                      label: `风险提示 ${index + 1}`,
                      text: flag,
                    })),
                    {
                      id: `${report.id}-review-notes`,
                      label: '审核备注',
                      text: report.reviewNotes || '暂无审核备注',
                    },
                  ]}
                  font={reviewDraftFonts.reportCopy}
                  lineHeight={24}
                  maxLines={3}
                  className="draft-layout-panel workspace-report-preflight"
                />
                {report.redFlags.length ? (
                  <ul className="workspace-list">
                    {report.redFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="workspace-notes">
                  审核备注：{report.reviewNotes || '暂无'}
                </p>
                <div className="workspace-row-actions">
                  <button
                    onClick={() => handleReportReview(report.id, 'approved')}
                    disabled={busyKey !== null}
                  >
                    {busyKey === `report-${report.id}-approved` ? '处理中…' : '通过'}
                  </button>
                  <button
                    className="is-secondary"
                    onClick={() => handleReportReview(report.id, 'rejected')}
                    disabled={busyKey !== null}
                  >
                    {busyKey === `report-${report.id}-rejected` ? '处理中…' : '驳回'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="workspace-panel">
          <div className="workspace-report-filter-bar" aria-label="审核数据来源筛选">
            {sourceFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={sourceFilter === option.value}
                onClick={() => setSourceFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {visiblePlans.map((plan) => {
            const planLead = leadById.get(plan.leadId);
            const smokeLead = isSmokeLead(planLead);
            return (
              <article key={plan.id} className="workspace-item">
                <div className="workspace-item-head">
                  <div>
                    <h2>
                      {plan.leadId}
                      {smokeLead ? <span className="workspace-source-badge workspace-source-badge-smoke">客户旅程 Smoke</span> : null}
                    </h2>
                    <p>
                      {plan.audience.segment} · {plan.audience.riskLevel} · {plan.steps.length} 个草稿
                    </p>
                  </div>
                  <strong>{statusBadge(plan.status)}</strong>
                </div>
                <p className="workspace-meta">
                  来源：{planLead?.source || '未记录'} · {plan.workflow.trigger} · {new Date(plan.createdAt).toLocaleString()}
                </p>

                <div className="workspace-review-grid">
                  <section className="workspace-review-block">
                    <h3>合规预检摘要</h3>
                    <ul className="workspace-list">
                      <li>{plan.complianceSummary.autoSendBlocked ? '已阻断自动发送' : '自动发送状态待确认'}</li>
                      <li>{plan.complianceSummary.requiredManualReview ? '必须人工审核' : '人工审核状态待确认'}</li>
                      {plan.complianceSummary.riskSignals.map((signal) => (
                        <li key={`${plan.id}-risk-${signal}`}>{signal}</li>
                      ))}
                    </ul>
                    <p className="workspace-notes">
                      {plan.complianceSummary.contentWarnings.join(' ')}
                    </p>
                  </section>

                  <section className="workspace-review-block">
                    <h3>人工跟进建议</h3>
                    <p className="workspace-notes">负责人：{ownerLabel(plan.manualFollowUp.owner)}</p>
                    <ul className="workspace-list">
                      <li>{plan.manualFollowUp.nextAction}</li>
                      <li>{plan.manualFollowUp.approvedAction}</li>
                      <li>{plan.manualFollowUp.rejectedAction}</li>
                    </ul>
                  </section>

                  <section className="workspace-review-block">
                    <h3>审核历史</h3>
                    {plan.reviewHistory.length ? (
                      <ul className="workspace-list">
                        {plan.reviewHistory.map((event) => (
                          <li key={`${plan.id}-${event.reviewedAt}-${event.status}`}>
                            {statusBadge(event.status)} · {event.reviewer} · {new Date(event.reviewedAt).toLocaleString()} ·{' '}
                            {event.notes || '无备注'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="workspace-notes">暂无审核历史</p>
                    )}
                  </section>
                </div>

                <DraftLayoutPreviewGroup
                  title="营销文案布局预检"
                  description="逐条查看草稿在移动端消息卡里的预计行数；通过前仍需人工审核内容边界。"
                  items={plan.steps.map((step) => ({
                    id: `${plan.id}-${step.channel}-${step.dayOffset}`,
                    label: `${step.channel} · 第 ${step.dayOffset} 天 · ${step.objective}`,
                    text: step.draftCopy,
                  }))}
                  font={reviewDraftFonts.marketingCopy}
                  lineHeight={24}
                  maxLines={3}
                  className="draft-layout-panel workspace-draft-preflight"
                />

                <ul className="workspace-list">
                  {plan.steps.map((step) => (
                    <li key={`${plan.id}-${step.channel}-${step.dayOffset}-summary`}>
                      {step.channel} · 第 {step.dayOffset} 天 · {step.objective}
                    </li>
                  ))}
                </ul>
                <p className="workspace-notes">
                  审核备注：{plan.reviewNotes || '暂无'}
                </p>
                <div className="workspace-row-actions">
                  <button
                    onClick={() => handlePlanReview(plan.id, 'approved')}
                    disabled={busyKey !== null}
                  >
                    {busyKey === `plan-${plan.id}-approved` ? '处理中…' : '通过'}
                  </button>
                  <button
                    className="is-secondary"
                    onClick={() => handlePlanReview(plan.id, 'rejected')}
                    disabled={busyKey !== null}
                  >
                    {busyKey === `plan-${plan.id}-rejected` ? '处理中…' : '驳回'}
                  </button>
                  {plan.status === 'rejected' ? (
                    <button
                      className="is-secondary"
                      onClick={() => handlePlanReview(plan.id, 'pending_manual_review')}
                      disabled={busyKey !== null}
                    >
                      {busyKey === `plan-${plan.id}-pending_manual_review` ? '处理中…' : '重新提交审核'}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
