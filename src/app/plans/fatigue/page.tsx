'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';

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
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
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
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">准备好恢复充沛精力了吗？</h2>
          <p className="text-slate-600 mb-8">立即加入购物车，开始你的科学抗疲劳之旅</p>
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
            <Link href="/plans/sleep" className="card-hover text-center">
              <div className="text-3xl mb-3">🌙</div>
              <h3 className="font-semibold text-slate-900 mb-2">深度睡眠组合</h3>
              <p className="text-sm text-slate-600">改善睡眠质量</p>
            </Link>
            <Link href="/plans/immune" className="card-hover text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-slate-900 mb-2">免疫防护组合</h3>
              <p className="text-sm text-slate-600">增强免疫防线</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
