'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { getAiConsultHrefForValue, getSolutionHrefForValue } from '@/lib/health/consult-entry';

const plan = {
  slug: 'sleep' as const,
  name: '深度睡眠组合',
  type: '神经兴奋型失眠',
  description: '适合入睡困难、浅睡、夜醒频繁的人群',
  price: 259,
  ingredients: [
    { name: 'GABA', dosage: '每晚1粒', detail: 'γ-氨基丁酸，大脑的"刹车系统"，降低神经兴奋性，帮助从亢奋状态平稳过渡到放松' },
    { name: '螯合镁', dosage: '每晚1粒', detail: '甘氨酸镁形式，放松肌肉与神经，参与褪黑素合成通路，提升深度睡眠比例' },
    { name: '褪黑素', dosage: '每晚1粒（0.3mg）', detail: '低剂量精准补充，重置昼夜节律，不产生依赖，适合倒时差和轮班人群' }
  ],
  suitableFor: [
    '躺下后脑子停不下来，入睡超过30分钟',
    '睡着了也容易醒，凌晨3-4点惊醒',
    '睡了8小时还是觉得累',
    '经常熬夜、作息不规律导致节律紊乱'
  ],
  mechanism: 'GABA抑制过度活跃的神经信号，镁参与GABA受体激活并放松平滑肌，低剂量褪黑素校准生物钟信号。三者协同，从"降噪→放松→定时"三个维度改善睡眠质量。',
  usage: '建议睡前30-60分钟服用。首周可能需要适应期，连续服用4周以上效果更稳定。',
  certifications: ['GMP认证', 'FDA注册', '第三方纯度检测', '无重金属残留']
};

export default function SleepPlanPage() {
  const consultHref = getAiConsultHrefForValue(plan.slug);
  const solutionHref = getSolutionHrefForValue(plan.slug);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-hero px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm text-teal hover:underline mb-4 inline-block">
            ← 返回首页
          </Link>
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
            <p className="text-sm font-semibold text-amber-900">旧组合参考页</p>
            <p className="mt-2 text-sm leading-7 text-amber-800">
              这个页面继续保留给已经熟悉旧组合的用户，但当前主路径已经切到 AI 评估。建议先完成评估，再决定是否进入购买入口。
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1">
              <span className="badge-teal mb-4">
                {plan.type}
              </span>
              <h1 className="text-4xl font-bold text-slate-900 mb-3 animate-fade-up">{plan.name}</h1>
              <p className="text-lg text-slate-600 mb-6">{plan.description}</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-orange">¥{plan.price}</span>
                <span className="text-slate-500">/月</span>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-5">
                <p className="text-sm font-semibold text-teal-800">建议先完成 AI 评估</p>
                <p className="mt-2 text-sm leading-7 text-teal-700">
                  AI 会先判断风险等级和问题方向，再带你进入方案页或购买入口，不再建议直接按旧组合下单。
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={consultHref} className="btn-primary">
                    先做 AI 评估
                  </Link>
                  <Link
                    href={solutionHref ?? consultHref}
                    className="btn-secondary"
                  >
                    {solutionHref ? '查看对应方案页' : '前往 AI 评估主入口'}
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-lg">
              <Image src="/images/plans/sleep.jpg" alt={plan.name} width={400} height={300} className="rounded-2xl object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">核心成分</h2>
          <div className="space-y-4 stagger-children">
            {plan.ingredients.map((ing) => (
              <div key={ing.name} className="card-hover">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{ing.name}</h3>
                  <span className="badge-teal">{ing.dosage}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{ing.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">适合人群</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plan.suitableFor.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                <svg className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">作用机制</h2>
          <p className="text-slate-600 leading-relaxed mb-8">{plan.mechanism}</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">服用建议</h2>
          <p className="text-slate-600 leading-relaxed">{plan.usage}</p>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">品质保障</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {plan.certifications.map((cert) => (
              <div key={cert} className="text-center rounded-lg bg-slate-50 p-4">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="text-sm font-semibold text-slate-700">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center">
          <span className="badge-slate">兼容购买入口</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 mb-4">如果你已经完成评估，也可以继续使用旧入口</h2>
          <p className="text-slate-600 mb-8">
            购买链路仍然保留，但建议先通过 AI 评估确认自己更适合睡眠支持、疲劳恢复，还是需要先线下咨询。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={consultHref} className="btn-primary">
              先做 AI 评估
            </Link>
            <AddToCartButton
              slug={plan.slug}
              name={plan.name}
              price={plan.price}
              className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">相关产品</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/products" className="card-hover text-center">
              <div className="text-3xl mb-3">💊</div>
              <h3 className="font-semibold text-slate-900 mb-2">浏览所有产品</h3>
              <p className="text-sm text-slate-600">发现更多健康补充方案</p>
            </Link>
            <Link href="/solutions/fatigue" className="card-hover text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-slate-900 mb-2">疲劳恢复方案</h3>
              <p className="text-sm text-slate-600">先看问题方案，再决定是否继续购买</p>
            </Link>
            <Link href="/ai-consult" className="card-hover text-center">
              <div className="text-3xl mb-3">🧘</div>
              <h3 className="font-semibold text-slate-900 mb-2">直接进入 AI 评估</h3>
              <p className="text-sm text-slate-600">如果问题不止睡眠，可以直接做完整评估</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
