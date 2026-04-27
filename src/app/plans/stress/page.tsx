'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { getAiConsultHrefForValue, getSolutionHrefForValue } from '@/lib/health/consult-entry';

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
              压力缓解组合仍然可访问，但当前站点没有单独的 canonical 压力方案页，这类用户应直接进入 AI 评估主入口。
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
                  压力问题常常会和睡眠、疲劳、应酬恢复等方向重叠。当前更推荐先做完整评估，而不是直接按旧组合购买。
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
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center">
          <span className="badge-slate">兼容购买入口</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 mb-4">如果你已经完成评估，也可以继续使用旧入口</h2>
          <p className="text-slate-600 mb-8">
            压力缓解组合继续保留，但现在更推荐先判断自己是睡眠问题、疲劳恢复，还是更适合从完整 AI 评估开始。
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
              <p className="text-sm text-slate-600">查看作息与恢复相关方案</p>
            </Link>
            <Link href="/solutions/immune" className="card-hover text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-slate-900 mb-2">免疫支持方案</h3>
              <p className="text-sm text-slate-600">查看恢复和日常防护方向</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
