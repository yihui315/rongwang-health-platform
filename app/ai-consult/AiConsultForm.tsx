'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const scenarioOptions = [
  { value: 'sleep-support', label: '睡眠与压力' },
  { value: 'brain-focus', label: '脑力与专注' },
  { value: 'digestive-support', label: '消化与代谢' },
  { value: 'joint-bone', label: '关节与骨骼' },
  { value: 'liver-metabolism', label: '肝胆代谢' },
  { value: 'immune-support', label: '免疫支持' },
  { value: 'men-health', label: '男士健康' },
  { value: 'women-health', label: '女士健康' },
];

const consentVersion = 'privacy-terms-2026-05';

type HealthReportPreview = {
  id: string;
  status: 'generated' | 'pending_manual_review' | 'approved' | 'rejected';
  scenarioLabel: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  redFlags: string[];
  manualReviewRequired: boolean;
  sections: Array<{
    title: string;
    summary: string;
    bullets: string[];
  }>;
  nutritionDirections: string[];
  nextActions: Array<{
    type: string;
    label: string;
    priority: number;
  }>;
  disclaimers: string[];
};

type MarketingPlanPreview = {
  id: string;
  status: 'pending_manual_review';
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
  workflow: {
    trigger: string;
    reviewGate: string;
    stopConditions: string[];
  };
};

function riskLabel(level: HealthReportPreview['riskLevel']): string {
  if (level === 'high') return '高风险';
  if (level === 'medium') return '中等风险';
  return '低风险';
}

function channelLabel(channel: string): string {
  const labels: Record<string, string> = {
    wechat_private: '微信私域',
    sms: '短信提醒',
    content_remarketing: '内容再触达',
    email: '邮件',
  };

  return labels[channel] ?? channel;
}

export default function AiConsultForm() {
  const searchParams = useSearchParams();
  const initialScenario = searchParams.get('scenario') || 'sleep-support';
  const productId = searchParams.get('product') || '';
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [scenarioSlug, setScenarioSlug] = useState(initialScenario);
  const [sleepHours, setSleepHours] = useState('6');
  const [stressLevel, setStressLevel] = useState('5');
  const [symptomDurationDays, setSymptomDurationDays] = useState('7');
  const [medicationUse, setMedicationUse] = useState('');
  const [pregnancyOrBreastfeeding, setPregnancyOrBreastfeeding] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [report, setReport] = useState<HealthReportPreview | null>(null);
  const [marketingPlan, setMarketingPlan] = useState<MarketingPlanPreview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setReport(null);
    setMarketingPlan(null);

    const selectedScenario = scenarioOptions.find((item) => item.value === scenarioSlug);
    try {
      const response = await fetch('/api/health-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          concern: selectedScenario?.label || scenarioSlug,
          scenarioSlug,
          source: productId ? 'product_consult' : 'ai_consult',
          consent: {
            privacyAccepted: privacyConsent,
            termsAccepted: privacyConsent,
            version: consentVersion,
            page: productId ? `/ai-consult?product=${productId}` : '/ai-consult',
          },
          answers: {
            sleepHours,
            stressLevel,
            symptomDurationDays,
            medicationUse,
            pregnancyOrBreastfeeding,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '提交失败');
      }

      setReport(data.report);
      setMessage('AI 健康报告已生成，顾问复核建议已进入人工确认流程。');

      const planResponse = await fetch('/api/marketing/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: data.report.id,
          channels: ['wechat_private', 'sms', 'content_remarketing'],
        }),
      });
      const planData = await planResponse.json();
      if (!planResponse.ok) {
        throw new Error(planData.error || '顾问复核建议生成失败');
      }

      setMarketingPlan(planData.plan);
      setName('');
      setContact('');
      setPrivacyConsent(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '提交失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="assessment-panel-stack">
      <form className="lead-form-card" onSubmit={handleSubmit}>
        <h2>生成 AI 健康报告</h2>
        <label>
          <span>称呼</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：李女士" required />
        </label>
        <label>
          <span>微信 / 手机 / WhatsApp</span>
          <input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="例如：li78035" required minLength={5} />
        </label>
        <label>
          <span>健康关注方向</span>
          <select value={scenarioSlug} onChange={(event) => setScenarioSlug(event.target.value)}>
            {scenarioOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="assessment-field-grid">
          <label>
            <span>睡眠时长</span>
            <input
              inputMode="decimal"
              value={sleepHours}
              onChange={(event) => setSleepHours(event.target.value)}
              placeholder="例如：6"
              required
            />
          </label>
          <label>
            <span>压力等级</span>
            <input
              inputMode="numeric"
              value={stressLevel}
              onChange={(event) => setStressLevel(event.target.value)}
              placeholder="0-10"
              required
            />
          </label>
        </div>
        <label>
          <span>困扰持续天数</span>
          <input
            inputMode="numeric"
            value={symptomDurationDays}
            onChange={(event) => setSymptomDurationDays(event.target.value)}
            placeholder="例如：7"
            required
          />
        </label>
        <label>
          <span>近期用药或特殊情况</span>
          <input
            value={medicationUse}
            onChange={(event) => setMedicationUse(event.target.value)}
            placeholder="例如：无 / 偶尔使用助眠药"
          />
        </label>
        <label className="assessment-checkbox">
          <input
            type="checkbox"
            checked={pregnancyOrBreastfeeding}
            onChange={(event) => setPregnancyOrBreastfeeding(event.target.checked)}
          />
          <span>孕期、哺乳期或备孕相关</span>
        </label>
        <label className="assessment-checkbox assessment-consent">
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(event) => setPrivacyConsent(event.target.checked)}
            required
          />
          <span>
            我已阅读并同意
            <Link href="/privacy">隐私政策</Link>
            和
            <Link href="/terms">服务条款</Link>
            ，知悉 AI 报告仅作健康教育参考，提交后进入顾问复核。
          </span>
        </label>
        {productId ? <p className="lead-form-hint">已带入产品咨询：{productId}</p> : null}
        <button className="simple-page-button" type="submit" disabled={submitting}>
          {submitting ? '生成中...' : '生成报告并提交顾问复核'}
        </button>
        {message ? <p className="lead-form-message">{message}</p> : null}
        <p className="lead-form-hint">提交后会生成健康教育报告和顾问复核建议，人工确认后才会联系。</p>
      </form>

      {report ? (
        <section className="assessment-result-panel" aria-live="polite">
          <div className="assessment-result-head">
            <span>风险分层</span>
            <strong>{riskLabel(report.riskLevel)}</strong>
          </div>
          <p>
            {report.scenarioLabel}风险关注指数 {report.overallScore}/100，分值越高越需要先人工复核。
            {report.manualReviewRequired ? '建议顾问先人工复核，再进入产品推荐。' : '可先进入健康教育和轻量咨询流程。'}
          </p>
          <ul className="assessment-summary-list">
            {report.sections
              .find((section) => section.title === '生活方式建议')
              ?.bullets.slice(0, 3)
              .map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="assessment-pill-row">
            {report.nutritionDirections.slice(0, 3).map((direction) => (
              <span key={direction}>{direction}</span>
            ))}
          </div>
          {marketingPlan ? (
            <div className="assessment-automation">
              <strong>顾问复核：待人工确认</strong>
              <p>
                已生成 {marketingPlan.steps.length} 条顾问跟进建议，覆盖
                {marketingPlan.steps.map((step) => channelLabel(step.channel)).join('、')}。
              </p>
              <p>审核闸口：{marketingPlan.workflow.reviewGate === 'manual_approval_required' ? '人工确认后才会联系' : '待确认'}。</p>
            </div>
          ) : null}
          <p className="lead-form-hint">{report.disclaimers[0]}</p>
        </section>
      ) : null}
    </div>
  );
}
