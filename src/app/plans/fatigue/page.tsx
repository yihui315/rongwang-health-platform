'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { getAiConsultHrefForValue, getSolutionHrefForValue } from '@/lib/health/consult-entry';

const plan = {
  slug: 'fatigue' as const,
  name: '抗疲劳组合',
  type: '高压力 + 营养流失型',
  description: '适合长期忙碌、精力容易透支的人群',
  price: 299,
  ingredients: [
    { name: '活性B族', dosage: '每日1粒', detail: '甲基化B12+叶酸，直接参与能量代谢，不需肝脏转化，吸收率是普通B族的3倍' },
    { name: '螯合镁', dosage: '每日1粒', detail: '甘氨酸镁形式，参与300+酶反应，缓解肌肉疲劳，改善深度睡眠质量' },
    { name: 'Omega-3', dosage: '每日2粒', detail: 'rTG型鱼油，EPA+DHA≥80%，抗炎护脑，维持细胞膜流动性' }
  ],
  suitableFor: [
    '经常加班、久坐办公',
    '下午容易犯困、精力断层',
    '饮食不规律，营养摄入不均',
    '运动后恢复慢、容易肌肉酸痛'
  ],
  mechanism: '通过补充能量代谢关键辅酶（B族维生素）和矿物质（镁），恢复线粒体产能效率；Omega-3降低慢性炎症水平，从根本上减少身体"内耗"。',
  usage: '建议随餐服用，持续8-12周可感受到明显的精力提升。',
  certifications: ['GMP认证', 'FDA注册', '第三方纯度检测', '无重金属残留']
};

export default function FatiguePlanPage() {
  const consultHref = getAiConsultHrefForValue(plan.slug);
  const solutionHref = getSolutionHrefForValue(plan.slug);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-hero px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm text-teal hover:underline mb-4 inline-block">
            ← 返回首页
          </Link>
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
            <p className="text-sm font-semibold text-amber-900">旧组合参考页</p>
            <p className="mt-2 text-sm leading-7 text-amber-800">
              旧组合页仍可访问，但当前站点已经改成先评估、再看方案、最后再进入购买入口的路径。
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
                  AI 会先判断是疲劳恢复、睡眠支持，还是需要优先线下排查，再决定是否继续使用旧购买入口。
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
              <Image src="/images/plans/fatigue.jpg" alt={plan.name} width={400} height={300} className="rounded-2xl object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients */}
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

      {/* Suitable For */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">适合人群</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plan.suitableFor.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                <svg className="h-5 w-5 text-teal mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mechanism */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">作用机制</h2>
          <p className="text-slate-600 leading-relaxed mb-8">{plan.mechanism}</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">服用建议</h2>
          <p className="text-slate-600 leading-relaxed">{plan.usage}</p>
        </div>
      </section>

      {/* Trust */}
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

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center">
          <span className="badge-slate">兼容购买入口</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 mb-4">如果你已经完成评估，也可以继续使用旧入口</h2>
          <p className="text-slate-600 mb-8">
            旧购买链路继续保留，但现在更推荐先判断疲劳是否来自恢复不足、睡眠债或持续高压输出。
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
            <Link href="/solutions/sleep" className="card-hover text-center">
              <div className="text-3xl mb-3">🌙</div>
              <h3 className="font-semibold text-slate-900 mb-2">睡眠支持方案</h3>
              <p className="text-sm text-slate-600">先看问题方案，再决定是否继续购买</p>
            </Link>
            <Link href="/solutions/immune" className="card-hover text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-slate-900 mb-2">免疫支持方案</h3>
              <p className="text-sm text-slate-600">查看日常防护与恢复支持方向</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
