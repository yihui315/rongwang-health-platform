'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';

const plan = {
  slug: 'stress' as const,
  name: '压力缓解组合',
  type: 'HPA轴过度激活型',
  description: '适合长期紧绷、焦虑、状态不稳定的人群',
  price: 399,
  ingredients: [
    { name: 'B族维生素', dosage: '每日1粒', detail: '活性甲基化B族，神经递质合成的关键辅酶，帮助血清素和多巴胺正常分泌' },
    { name: '螯合镁', dosage: '每日1粒', detail: 'L-苏糖酸镁，唯一能有效穿过血脑屏障的镁形式，直接作用于中枢神经系统' },
    { name: '适应原草本', dosage: '每日1粒', detail: '南非醉茄(Ashwagandha) KSM-66专利提取物，临床验证可降低皮质醇水平27%' }
  ],
  suitableFor: [
    '工作压力大，经常感到紧绷焦虑',
    '情绪波动明显，容易烦躁易怒',
    '考试备考、项目冲刺等高压期',
    '长期处于高强度竞争环境中'
  ],
  mechanism: 'B族维生素确保神经递质合成原料充足，苏糖酸镁穿过血脑屏障直接安抚过度兴奋的神经，KSM-66从HPA轴层面调节皮质醇分泌节律，三管齐下从根源降低压力反应强度。',
  usage: '建议每日随早餐服用。高压期可增加至每日两次（早、午餐后各一次）。持续8周以上效果更稳定。',
  certifications: ['GMP认证', 'FDA注册', '第三方纯度检测', '无重金属残留']
};

export default function StressPlanPage() {
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
              <Image src="/images/plans/stress.jpg" alt={plan.name} width={400} height={300} className="rounded-2xl object-cover w-full h-full" />
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
                <svg className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-4">找回内心的平静与从容</h2>
          <p className="text-slate-600 mb-8">从HPA轴源头调节，让身体学会正确应对压力</p>
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
