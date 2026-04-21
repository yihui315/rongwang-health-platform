'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';

const plan = {
  slug: 'immune' as const,
  name: '免疫防护组合',
  type: '免疫防线薄弱型',
  description: '适合换季易感冒、身体防御力偏弱的人群',
  price: 349,
  ingredients: [
    { name: '维生素C', dosage: '每日1粒（500mg）', detail: '缓释型维C，持续12小时释放，促进白细胞生成和活性，强化黏膜屏障防线' },
    { name: '锌', dosage: '每日1粒（15mg）', detail: '螯合锌形式，免疫细胞的"弹药"，参与T细胞成熟和NK细胞激活' },
    { name: '维生素D3', dosage: '每日1粒（2000IU）', detail: '脂溶性维D3，激活先天免疫应答，调节免疫T细胞分化，90%国人缺乏' },
    { name: '接骨木莓', dosage: '每日1粒', detail: '欧洲传统植物提取，富含花青素，临床研究显示可缩短感冒病程2-4天' }
  ],
  suitableFor: [
    '换季时容易感冒、喉咙痛',
    '办公室/学校人多，交叉感染风险高',
    '恢复期，大病初愈后体质偏弱',
    '户外活动多，环境变化频繁'
  ],
  mechanism: '维C和锌直接增强免疫细胞战斗力，D3从上游调节免疫系统的"指挥部"，接骨木莓提供植物活性成分辅助抗病毒。四重防护，构建完整免疫链条。',
  usage: '建议每日随早餐服用。换季前2周开始服用效果更佳，持续整个易感季节。',
  certifications: ['GMP认证', 'FDA注册', '第三方纯度检测', '无重金属残留']
};

export default function ImmunePlanPage() {
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
              <Image src="/images/plans/immune.jpg" alt={plan.name} width={400} height={300} className="rounded-2xl object-cover w-full h-full" />
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
                <svg className="h-5 w-5 text-green-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-4">提前防护，不给病毒机会</h2>
          <p className="text-slate-600 mb-8">四重免疫防线，从内到外筑起保护屏障</p>
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
            <Link href="/plans/sleep" className="card-hover text-center">
              <div className="text-3xl mb-3">🌙</div>
              <h3 className="font-semibold text-slate-900 mb-2">深度睡眠组合</h3>
              <p className="text-sm text-slate-600">改善睡眠质量</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
