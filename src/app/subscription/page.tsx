import Link from 'next/link';
import { plans } from '@/data/plans';
import { getAiConsultHrefForValue, getSolutionHrefForValue } from '@/lib/health/consult-entry';

const subscriptionTiers = [
  {
    id: 'monthly',
    name: '月度订阅',
    discount: 0,
    period: '每月配送',
    highlight: false,
    features: ['灵活取消', '免运费', '专属营养师咨询', '随时调整方案'],
  },
  {
    id: 'quarterly',
    name: '季度订阅',
    discount: 15,
    period: '每3个月配送',
    highlight: true,
    badge: '最受欢迎',
    features: ['节省15%', '免运费', '专属营养师咨询', '优先客服', '免费定期检测'],
  },
  {
    id: 'yearly',
    name: '年度订阅',
    discount: 25,
    period: '每12个月配送',
    highlight: false,
    features: ['节省25%', '免运费', '专属营养师咨询', '优先客服', '免费定期检测', '年度健康报告'],
  },
];

export default function SubscriptionPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-b from-teal-50 to-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-700 mb-4">
            订阅服务 · 持续健康
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            让健康成为一种习惯
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            订阅制配送,省心省钱,每月/每季/每年定期收到你的健康方案
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">选择订阅周期</h2>
          <p className="text-center text-slate-600 mb-12">订阅越久,越省越多</p>

          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-8 ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-2xl scale-105'
                    : 'bg-white shadow-sm border border-slate-200'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
                    {tier.badge}
                  </div>
                )}

                <h3 className={`text-2xl font-bold mb-2 ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm mb-6 ${tier.highlight ? 'text-teal-100' : 'text-slate-500'}`}>
                  {tier.period}
                </p>

                <div className="mb-6">
                  {tier.discount > 0 ? (
                    <div>
                      <div className={`text-5xl font-bold ${tier.highlight ? 'text-white' : 'text-teal-600'}`}>
                        -{tier.discount}%
                      </div>
                      <div className={`text-sm mt-1 ${tier.highlight ? 'text-teal-100' : 'text-slate-500'}`}>
                        相比单次购买
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={`text-5xl font-bold ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                        基础价
                      </div>
                      <div className={`text-sm mt-1 ${tier.highlight ? 'text-teal-100' : 'text-slate-500'}`}>
                        无折扣
                      </div>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlight ? 'text-teal-100' : 'text-teal-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={tier.highlight ? 'text-teal-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/ai-consult"
                  className={`block w-full text-center py-3 rounded-full font-semibold transition ${
                    tier.highlight
                      ? 'bg-white text-teal-600 hover:bg-teal-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  开始订阅
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">选择健康方案</h2>
          <p className="text-center text-slate-600 mb-12">所有方案均支持订阅制</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Link
                key={plan.slug}
                href={getSolutionHrefForValue(plan.slug) ?? getAiConsultHrefForValue(plan.slug)}
                className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg transition group"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-teal-600">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4">{plan.type}</p>
                <div className="text-2xl font-bold text-teal-600 mb-2">¥{plan.price}</div>
                <div className="text-xs text-slate-500">月度订阅起</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">订阅常见问题</h2>

          <div className="space-y-4">
            {[
              { q: '可以随时取消订阅吗?', a: '可以。所有订阅均支持随时取消,无需额外费用,剩余未配送部分自动退款。' },
              { q: '可以更换方案吗?', a: '可以。你可以在配送前随时更换方案或调整剂量,客服会帮你处理。' },
              { q: '配送频率是固定的吗?', a: '月度订阅每30天配送一次,季度每90天,年度每年一次。你也可以手动调整配送时间。' },
              { q: '订阅有最低承诺期吗?', a: '没有。月度订阅可以在任何时候取消,不存在违约金。' },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-xl bg-white border border-slate-200 p-6"
              >
                <summary className="cursor-pointer font-semibold text-slate-900 flex items-center justify-between">
                  {item.q}
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="mx-auto max-w-3xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">不确定选哪个方案?</h2>
          <p className="text-teal-100 mb-8">3分钟AI健康测验,为你量身定制最适合的订阅方案</p>
          <Link
            href="/ai-consult"
            className="inline-block rounded-full bg-white text-teal-600 px-8 py-4 font-semibold hover:bg-teal-50 transition"
          >
            开始AI测验 →
          </Link>
        </div>
      </section>
    </main>
  );
}
