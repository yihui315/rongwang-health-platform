'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const defaultMetrics = [
  { label: '精力指数', key: 'energy', value: 78, change: '+12', trend: 'up' as const, color: 'from-emerald-400 to-emerald-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
  { label: '睡眠质量', key: 'sleep', value: 82, change: '+8', trend: 'up' as const, color: 'from-indigo-400 to-violet-600', bgLight: 'bg-indigo-50', textColor: 'text-indigo-600', icon: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' },
  { label: '压力水平', key: 'stress', value: 45, change: '-15', trend: 'down' as const, color: 'from-amber-400 to-orange-500', bgLight: 'bg-amber-50', textColor: 'text-amber-600', icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18' },
  { label: '免疫力', key: 'immunity', value: 85, change: '+5', trend: 'up' as const, color: 'from-teal-400 to-cyan-500', bgLight: 'bg-teal-50', textColor: 'text-teal-600', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
];

const currentPlan = {
  name: '抗疲劳+深度睡眠方案',
  status: '配送中',
  nextDelivery: '2026-04-15',
  progress: 65,
  daysLeft: 12,
  products: ['B族维生素复合片', '镁甘氨酸胶囊', 'GABA助眠片'],
};

const recentOrders = [
  { id: 'RW20260401', date: '2026-04-01', plan: '抗疲劳方案', amount: 299, status: '已送达' },
  { id: 'RW20260301', date: '2026-03-01', plan: '抗疲劳方案', amount: 299, status: '已送达' },
  { id: 'RW20260201', date: '2026-02-01', plan: '基础营养方案', amount: 239, status: '已送达' },
];

const defaultInsights = [
  { title: '精力指数上升', desc: '过去30天精力指数提升12分，可能与规律补充B族维生素有关。建议保持当前方案。', type: 'success' as const },
  { title: '维生素D偏低提醒', desc: '根据你的打卡记录，户外时间较少。建议下次方案加入维生素D3补充。', type: 'warning' as const },
  { title: '目标达成', desc: '本月睡眠质量目标已达成82%。继续保持睡前1小时远离电子屏幕的习惯。', type: 'info' as const },
];

const weeklyData = [
  { day: '一', energy: 72, sleep: 80 },
  { day: '二', energy: 68, sleep: 75 },
  { day: '三', energy: 80, sleep: 85 },
  { day: '四', energy: 75, sleep: 82 },
  { day: '五', energy: 70, sleep: 78 },
  { day: '六', energy: 85, sleep: 90 },
  { day: '日', energy: 82, sleep: 88 },
];

const checkinItems = [
  { id: 'supplement', label: '已服用营养补剂', icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' },
  { id: 'water', label: '已喝够2L水', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'exercise', label: '运动30分钟+', icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z' },
  { id: 'sleep-early', label: '23:00前入睡', icon: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' },
];

const insightTypeStyle = {
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200/60', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200/60', dot: 'bg-amber-500' },
  info: { bg: 'bg-sky-50', border: 'border-sky-200/60', dot: 'bg-sky-500' },
};

type DashboardMetric = (typeof defaultMetrics)[number];
type DashboardInsight = (typeof defaultInsights)[number];

export interface DashboardCurrentPlan {
  name: string;
  status: string;
  nextDelivery: string;
  progress: number;
  daysLeft: number;
  products: string[];
}

export interface DashboardOrder {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: string;
}

const emptyMetrics: DashboardMetric[] = defaultMetrics.map((metric) => ({
  ...metric,
  value: 0,
  change: '0',
}));

const emptyCurrentPlan: DashboardCurrentPlan = {
  name: '暂无订阅方案',
  status: '未开通',
  nextDelivery: '-',
  progress: 0,
  daysLeft: 0,
  products: [],
};

const emptyRecentOrders: DashboardOrder[] = [];
const emptyInsights: DashboardInsight[] = [];

interface DashboardClientProps {
  customerEmail?: string;
  currentPlan?: DashboardCurrentPlan;
  initialInsights?: DashboardInsight[];
  metrics?: DashboardMetric[];
  recentOrders?: DashboardOrder[];
}

export default function DashboardClient({
  customerEmail,
  currentPlan = emptyCurrentPlan,
  initialInsights = emptyInsights,
  metrics = emptyMetrics,
  recentOrders = emptyRecentOrders,
}: DashboardClientProps) {
  const [insights, setInsights] = useState(initialInsights);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showCheckinSuccess, setShowCheckinSuccess] = useState(false);
  const displayName = customerEmail?.split('@')[0] || 'Customer';

  const fetchInsights = useCallback(async () => {
    const metricPayload = {
      energy: metrics.find((metric) => metric.key === 'energy')?.value ?? 0,
      sleep: metrics.find((metric) => metric.key === 'sleep')?.value ?? 0,
      stress: metrics.find((metric) => metric.key === 'stress')?.value ?? 0,
      immunity: metrics.find((metric) => metric.key === 'immunity')?.value ?? 0,
    };

    if (!Object.values(metricPayload).some((value) => value > 0)) {
      setInsights(initialInsights);
      return;
    }

    setIsLoadingInsights(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricPayload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insights?.length) setInsights(data.insights);
      }
    } catch {
      // keep default
    } finally {
      setIsLoadingInsights(false);
    }
  }, [initialInsights, metrics]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const toggleCheckin = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCheckinSubmit = () => {
    setShowCheckinSuccess(true);
    setTimeout(() => setShowCheckinSuccess(false), 3000);
  };

  const weeklyDisplayData = weeklyData.map((day) => ({ ...day, energy: 0, sleep: 0 }));
  const maxBar = Math.max(1, ...weeklyDisplayData.map((d) => Math.max(d.energy, d.sleep)));

  return (
    <main className="min-h-screen bg-[#fafbfc]">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-6 lg:px-8 py-10 md:py-14">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.03]" />
        <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[400px] rounded-full bg-teal-500/10 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[13px] mb-1.5">欢迎回来</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{displayName} 的健康档案</h1>
            <p className="text-slate-400 text-[14px] mt-1">持续追踪你的健康旅程</p>
          </div>
          <div className="hidden md:flex gap-2.5">
            <Link href="/family" className="rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10 transition-all">
              家庭档案
            </Link>
            <Link href="/ai-consult" className="rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-900 hover:bg-slate-50 transition-all shadow-sm">
              重新测验
            </Link>
          </div>
        </div>
      </section>

      {/* Health Metrics — floating cards */}
      <section className="px-6 lg:px-8 -mt-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <div
                key={m.key}
                className="rounded-2xl bg-white border border-slate-200/80 p-5 hover:shadow-md transition-all animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`h-8 w-8 rounded-lg ${m.bgLight} flex items-center justify-center`}>
                    <svg className={`h-4 w-4 ${m.textColor}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
                    </svg>
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium">{m.label}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">{m.value}</span>
                  <span className={`text-[12px] font-semibold ${
                    (m.key === 'stress' && m.trend === 'down') || (m.key !== 'stress' && m.trend === 'up')
                      ? 'text-emerald-600'
                      : 'text-orange-500'
                  }`}>
                    {m.change}
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-1000`}
                    style={{ width: `${m.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main 2-column layout */}
      <section className="px-6 lg:px-8 py-8 md:py-12">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-3 gap-6">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current plan */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">当前方案</h2>
                <span className="rounded-full bg-teal-50 ring-1 ring-teal-200/60 px-3 py-1 text-[11px] font-semibold text-teal-700">
                  {currentPlan.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">{currentPlan.name}</h3>
              <p className="text-[13px] text-slate-400 mb-5">下次配送：{currentPlan.nextDelivery}</p>

              <div className="mb-5">
                <div className="flex justify-between text-[13px] mb-2">
                  <span className="text-slate-500">本周期进度</span>
                  <span className="font-semibold text-teal-600 tabular-nums">剩余 {currentPlan.daysLeft} 天</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-1000"
                    style={{ width: `${currentPlan.progress}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">方案包含</p>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.products.map((p) => (
                    <span key={p} className="rounded-full bg-slate-50 ring-1 ring-slate-200/60 px-3 py-1 text-[12px] text-slate-600 font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Link href="/subscription" className="flex-1 text-center rounded-full bg-slate-900 text-white py-2.5 text-[14px] font-semibold hover:bg-slate-800 transition-all shadow-sm">
                  管理订阅
                </Link>
                <Link href="/products" className="flex-1 text-center rounded-full border border-slate-200 text-slate-600 py-2.5 text-[14px] font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all">
                  调整方案
                </Link>
              </div>
            </div>

            {/* Weekly chart */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">本周趋势</h2>
                <div className="flex items-center gap-5 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-teal-400 to-teal-600" />
                    <span className="text-slate-500">精力</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-indigo-400 to-violet-500" />
                    <span className="text-slate-500">睡眠</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-44">
                {weeklyDisplayData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex gap-1 items-end" style={{ height: '140px' }}>
                      <div
                        className="flex-1 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t transition-all duration-700"
                        style={{ height: `${(d.energy / maxBar) * 100}%`, minHeight: '4px' }}
                        title={`精力 ${d.energy}`}
                      />
                      <div
                        className="flex-1 bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t transition-all duration-700"
                        style={{ height: `${(d.sleep / maxBar) * 100}%`, minHeight: '4px' }}
                        title={`睡眠 ${d.sleep}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order History */}
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">订单记录</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-6 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">订单号</th>
                      <th className="text-left px-6 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">日期</th>
                      <th className="text-left px-6 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">方案</th>
                      <th className="text-right px-6 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">金额</th>
                      <th className="text-center px-6 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-[13px] font-mono text-slate-600">{o.id}</td>
                        <td className="px-6 py-3.5 text-[13px] text-slate-500">{o.date}</td>
                        <td className="px-6 py-3.5 text-[13px] text-slate-900 font-medium">{o.plan}</td>
                        <td className="px-6 py-3.5 text-[13px] text-right font-semibold text-slate-900 tabular-nums">¥{o.amount}</td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="rounded-full bg-emerald-50 ring-1 ring-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Daily Check-in */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4">今日打卡</h2>
              <div className="space-y-2">
                {checkinItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheckin(item.id)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                      checkedItems.has(item.id)
                        ? 'bg-teal-50 ring-1 ring-teal-200/60'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      checkedItems.has(item.id) ? 'bg-teal-100' : 'bg-white'
                    }`}>
                      <svg className={`h-4 w-4 ${checkedItems.has(item.id) ? 'text-teal-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <span className={`flex-1 text-[13px] font-medium ${checkedItems.has(item.id) ? 'text-teal-700' : 'text-slate-600'}`}>
                      {item.label}
                    </span>
                    {checkedItems.has(item.id) && (
                      <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCheckinSubmit}
                disabled={checkedItems.size === 0}
                className="mt-4 w-full rounded-full bg-slate-900 py-2.5 text-[13px] font-semibold text-white hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                {showCheckinSuccess ? '打卡成功' : `提交打卡 (${checkedItems.size}/${checkinItems.length})`}
              </button>
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI 健康洞察</h2>
                <button
                  onClick={fetchInsights}
                  disabled={isLoadingInsights}
                  className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  {isLoadingInsights ? '分析中...' : '刷新'}
                </button>
              </div>
              <p className="text-[12px] text-slate-400 mb-4">由一辉智能体生成</p>

              <div className="space-y-2.5">
                {insights.map((ins, i) => {
                  const style = insightTypeStyle[ins.type] || insightTypeStyle.info;
                  return (
                    <div key={i} className={`rounded-xl ${style.bg} border ${style.border} p-4`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${style.dot} mt-1.5 flex-shrink-0`} />
                        <div>
                          <h4 className="font-semibold text-[13px] text-slate-800 mb-1">{ins.title}</h4>
                          <p className="text-[12px] text-slate-500 leading-relaxed">{ins.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2.5">
              {[
                { href: '/articles', label: '健康文章', desc: '阅读最新健康科普', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
                { href: '/family', label: '家庭档案', desc: '为家人添加健康档案', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
                { href: '/ai-consult', label: '重新评估', desc: '更新你的健康方案', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl bg-white border border-slate-200/80 p-4 hover:shadow-md hover:border-slate-300 transition-all group"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                    <svg className="h-5 w-5 text-slate-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{link.label}</h3>
                    <p className="text-[12px] text-slate-400">{link.desc}</p>
                  </div>
                  <svg className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
