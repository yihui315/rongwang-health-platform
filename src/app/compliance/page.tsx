/**
 * 合规与资质页面
 * 路由：/compliance
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "合规与资质 | 香港荣旺健康",
  description:
    "了解香港荣旺健康的跨境电商合规资质、食品安全认证、产品信息披露及消费者权益保护政策。",
  robots: { index: true, follow: true },
};

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-6">
        <div aria-hidden className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/trust-ingredients_001.jpg"
            alt=""
            className="h-full w-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
        </div>
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">合规与资质</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            香港荣旺健康严格遵守跨境电商监管要求，所有产品均通过正规渠道进口并符合相关法规。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 space-y-14">

        {/* 跨境电商合规 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🌐</div>
            <h2 className="text-2xl font-bold text-slate-900">跨境电商合规</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-800 mb-4">监管合规</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    跨境电子商务综合试验区合规进口
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    海关清关及检验检疫证明（CIQ）
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    原产地证明及原瓶进口报关单
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    电子商务交易消费者权益保护规范
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-4">产品注册</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    营养补充剂配方符合产地国法规要求
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    中国海关进出口检验检疫（CIQ）批文
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    香港公司注册处备案证明
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    品牌授权链路完整可溯源
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 食品安全认证 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🏭</div>
            <h2 className="text-2xl font-bold text-slate-900">食品安全认证</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="font-bold text-slate-800 text-lg mb-1">MAK Pharma（美国）</h3>
              <p className="text-xs text-slate-500 mb-4">加利福尼亚州 ·符合 FDA cGMP</p>
              <div className="grid grid-cols-2 gap-3">
                {["NSF cGMP 认证", "FDA 注册工厂", "UL 认证", "加拿大卫生部认证"].map((cert) => (
                  <div key={cert} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500 shrink-0">✓</span>
                    {cert}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="font-bold text-slate-800 text-lg mb-1">Medicap Laboratories（美国）</h3>
              <p className="text-xs text-slate-500 mb-4">美国</p>
              <div className="grid grid-cols-2 gap-3">
                {["GMP 认证", "NSF 认证", "高标准生产规范", "质量检测报告每批可查"].map((cert) => (
                  <div key={cert} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500 shrink-0">✓</span>
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-5">
            <p className="text-sm text-amber-800 font-semibold mb-2">第三方检测机构</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              每批次产品均经过 SGS 第三方机构检测，检测项目包括：重金属残留、微生物限度、功效成分含量。
              检测报告可通过产品防伪标签扫码查询。
            </p>
          </div>
        </section>

        {/* 产品信息披露 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">📋</div>
            <h2 className="text-2xl font-bold text-slate-900">产品信息披露</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { title: "成分透明", desc: "所有产品均标注功效成分、剂量、来源及适用人群" },
                { title: "来源可查", desc: "原料供应商信息可查，批次信息扫码可追溯" },
                { title: "服用指导", desc: "每款产品均提供明确的服用方法、周期及注意事项" },
                { title: "警示说明", desc: "清楚标注不适用人群及就医警示信号" },
                { title: "存储建议", desc: "提供产品存储条件及保质期说明" },
                { title: "过敏提示", desc: "标注可能引起过敏的成分（如有）" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-slate-50 p-5">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 消费者权益保护 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🛡️</div>
            <h2 className="text-2xl font-bold text-slate-900">消费者权益保护</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-2xl">
                 💳
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">安全支付</h4>
                <p className="text-xs text-slate-500 leading-relaxed">拼多多/京东平台监管交易，支持平台退款保障</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-2xl">
                  ↩️
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">退货政策</h4>
                <p className="text-xs text-slate-500 leading-relaxed">未开封产品7天内可申请退货，客服全程协助</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-2xl">
                  💬
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">顾问服务</h4>
                <p className="text-xs text-slate-500 leading-relaxed">购买前后均可咨询健康顾问，全程跟踪服务</p>
              </div>
            </div>
          </div>
        </section>

        {/* 免责声明 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900">重要声明</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <ul className="space-y-4">
              {[
                "营养补充剂为膳食补充剂，不能替代医生的专业治疗或处方药物",
                "产品功效描述仅用于健康教育目的，不构成治疗、治愈或预防任何疾病的承诺",
                "如有慢性病、正在服药、备孕、孕期、哺乳期或出现明显不适，使用前请先咨询医生",
                "跨境产品符合产地国及中国的相关进口法规，但不能替代本地监管部门的备案或注册",
                "消费者应通过正规授权渠道购买，产品来源不明将无法享受正品保障和售后服务",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 相关链接 */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">了解更多</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/trust-center"
              className="rounded-xl bg-white/10 border border-white/20 p-5 text-center hover:bg-white/20 transition-colors"
            >
              <p className="text-2xl mb-2">🏢</p>
              <p className="font-semibold text-white text-sm">信任中心</p>
              <p className="text-slate-400 text-xs mt-1">品牌授权与防伪查询</p>
            </Link>
            <Link
              href="/shipping"
              className="rounded-xl bg-white/10 border border-white/20 p-5 text-center hover:bg-white/20 transition-colors"
            >
              <p className="text-2xl mb-2">🚚</p>
              <p className="font-semibold text-white text-sm">配送与售后</p>
              <p className="text-slate-400 text-xs mt-1">物流政策与退换货</p>
            </Link>
            <Link
              href="/privacy"
              className="rounded-xl bg-white/10 border border-white/20 p-5 text-center hover:bg-white/20 transition-colors"
            >
              <p className="text-2xl mb-2">🔒</p>
              <p className="font-semibold text-white text-sm">隐私政策</p>
              <p className="text-slate-400 text-xs mt-1">个人信息保护</p>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}