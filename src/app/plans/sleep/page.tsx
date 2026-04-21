'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';

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
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-hero px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm text-teal hover:underline mb-4 inline-block">
            ← 返回首页
          </Link>
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
              <AddToCartButton slug={plan.slug} name={plan.name} price={plan.price} className="btn-primary" />
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
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">今晚开始，睡个好觉</h2>
          <p className="text-slate-600 mb-8">科学配比，温和助眠，不依赖不残留</p>
          <AddToCartButton slug={plan.slug} name={plan.name} price={plan.price} className="btn-primary text-lg px-10 py-4" />
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
            <Link href="/plans/fatigue" className="card-hover text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-slate-900 mb-2">抗疲劳组合</h3>
              <p className="text-sm text-slate-600">恢复充沛精力</p>
            </Link>
            <Link href="/plans/stress" className="card-hover text-center">
              <div className="text-3xl mb-3">🧘</div>
              <h3 className="font-semibold text-slate-900 mb-2">压力缓解组合</h3>
              <p className="text-sm text-slate-600">放松身心压力</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
