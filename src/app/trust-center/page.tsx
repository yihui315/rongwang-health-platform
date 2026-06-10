/**
 * 信任中心页面
 * 路由：/trust-center
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "信任中心 | 香港荣旺健康",
  description:
    "了解香港荣旺健康的品牌授权、产品质量认证、第三方检测报告、防伪查询方法和正品购买渠道。",
  robots: { index: true, follow: true },
};

export default function TrustCenterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">信任中心</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            香港荣旺健康所有产品均来自正规授权渠道，每批产品均可溯源。点击下方模块查看对应资质证明。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 space-y-14">

        {/* 公司主体 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🏢</div>
            <h2 className="text-2xl font-bold text-slate-900">公司主体</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-slate-800 mb-3">香港荣旺健康科技有限公司</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>注册地：香港</li>
                <li>业务：跨境保健品及营养补充剂进口</li>
                <li>专注领域：心血管、骨骼关节、肠道、脑力精准营养</li>
                <li>合作品牌：1970 Uncle Darren's 恩科達倫</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-3">主营业务许可</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>香港注册公司编号：已备案</li>
                <li>跨境电商合规进口</li>
                <li>海关清关及检验检疫证明</li>
                <li>正品授权链路完整</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 品牌授权 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">📜</div>
            <h2 className="text-2xl font-bold text-slate-900">品牌授权</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-20 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shrink-0">
                🇺🇸
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">1970 Uncle Darren's 恩科達倫</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  香港荣旺健康科技有限公司为 1970 Uncle Darren's 恩科達倫品牌的授权战略合作伙伴，
                  负责该品牌产品在大中华区的推广、进口及销售。所有产品均为美国原瓶进口。
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-2xl mb-2">🇺🇸</p>
                <p className="font-semibold text-slate-800 text-sm">美国原瓶进口</p>
                <p className="text-xs text-slate-500 mt-1">正规海关报关单</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-2xl mb-2">📋</p>
                <p className="font-semibold text-slate-800 text-sm">授权合作协议</p>
                <p className="text-xs text-slate-500 mt-1">战略合作伙件</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="font-semibold text-slate-800 text-sm">防伪追溯系统</p>
                <p className="text-xs text-slate-500 mt-1">每盒可查</p>
              </div>
            </div>
          </div>
        </section>

        {/* 生产工厂 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🏭</div>
            <h2 className="text-2xl font-bold text-slate-900">生产工厂</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="font-bold text-slate-800 text-lg mb-1">MAK Pharma</h3>
              <p className="text-xs text-slate-500 mb-4">美国 · 加利福尼亚州</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>· NSF cGMP 认证</li>
                <li>· FDA 注册工厂</li>
                <li>· UL 认证</li>
                <li>· 加拿大卫生部认证</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="font-bold text-slate-800 text-lg mb-1">Medicap Laboratories</h3>
              <p className="text-xs text-slate-500 mb-4">美国</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>· GMP 认证</li>
                <li>· NSF 认证</li>
                <li>· 高标准生产规范</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 原料供应商 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🧪</div>
            <h2 className="text-2xl font-bold text-slate-900">全球原料供应商</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm text-slate-600 mb-6">荣旺健康产品原料来自全球顶级供应商，包括：</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="font-bold text-slate-800 text-sm">BASF</p>
                <p className="text-xs text-slate-500 mt-1">德国 · 营养原料</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="font-bold text-slate-800 text-sm">Chemi Nutra</p>
                <p className="text-xs text-slate-500 mt-1">美国 · 辅酶Q10</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="font-bold text-slate-800 text-sm">DuPont</p>
                <p className="text-xs text-slate-500 mt-1">美国 · 益生菌</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="font-bold text-slate-800 text-sm">DSM</p>
                <p className="text-xs text-slate-500 mt-1">荷兰/美国 · 维生素</p>
              </div>
            </div>
          </div>
        </section>

        {/* 第三方检测 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🔬</div>
            <h2 className="text-2xl font-bold text-slate-900">第三方检测</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
                <p className="font-bold text-slate-800 text-sm">SGS 第三方检测</p>
                <p className="text-xs text-slate-500 mt-1">每批出货检测</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
                <p className="font-bold text-slate-800 text-sm">无重金属残留</p>
                <p className="text-xs text-slate-500 mt-1">每批检测</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
                <p className="font-bold text-slate-800 text-sm">纯度与含量验证</p>
                <p className="text-xs text-slate-500 mt-1">工厂出厂报告</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
                <p className="font-bold text-slate-800 text-sm">正品防伪验证</p>
                <p className="text-xs text-slate-500 mt-1">扫码可查</p>
              </div>
            </div>
            <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-5">
              <p className="text-sm text-amber-800 font-semibold mb-2">如何查询检测报告？</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                每盒产品均贴有防伪标签，扫码可验证真伪并查看批次信息。如需查看详细检测报告，
                请添加荣旺健康顾问微信号（rongwanghealth）获取。
              </p>
            </div>
          </div>
        </section>

        {/* 防伪查询 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🔏</div>
            <h2 className="text-2xl font-bold text-slate-900">防伪查询</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-800 mb-4">查询步骤</h3>
                <ol className="space-y-3">
                  {[
                    "刮开产品包装上的防伪涂层",
                    "扫描包装上的二维码",
                    "输入防伪码验证",
                    "查看产品批次和来源信息",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-xl bg-slate-50 p-6">
                <h3 className="font-bold text-slate-800 mb-3">防伪标签说明</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>· 每盒产品均有独立防伪码</li>
                  <li>· 防伪码只能验证一次，重复验证会有提示</li>
                  <li>· 如验证显示异常，请联系顾问</li>
                  <li>· 正品保障，假一罚十</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 正品购买渠道 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🛒</div>
            <h2 className="text-2xl font-bold text-slate-900">正品购买渠道</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📦</span>
                <h3 className="font-bold text-slate-800 text-lg">拼多多旗舰店</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 mb-5">
                <li>· 店铺评分高</li>
                <li>· 累计销量可观</li>
                <li>· 正品保障</li>
                <li>· 平台监管交易</li>
              </ul>
              <Link href="/shop" className="inline-block rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors">
                进店购买 →
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏪</span>
                <h3 className="font-bold text-slate-800 text-lg">京东国际旗舰店</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 mb-5">
                <li>· 京东平台监管</li>
                <li>· 正品溯源</li>
                <li>· 京东物流配送</li>
                <li>· 售后服务完善</li>
              </ul>
              <Link href="/shop" className="inline-block rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors">
                进店购买 →
              </Link>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-5">
            <p className="text-sm text-amber-800 font-semibold mb-2">未在其他平台开设店铺</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              荣旺健康目前仅在拼多多和京东国际开设旗舰店，未在淘宝、天猫、抖音等其他平台授权销售。
              如在其他平台看到我司产品，不保证为正品。
            </p>
          </div>
        </section>

        {/* 物流与售后 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">🚚</div>
            <h2 className="text-2xl font-bold text-slate-900">物流与售后</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl mb-2">📦</p>
                <p className="font-bold text-slate-800 text-sm mb-1">跨境配送</p>
                <p className="text-xs text-slate-500">海关清关，正规检验检疫</p>
              </div>
              <div className="text-center">
                <p className="text-2xl mb-2">↩️</p>
                <p className="font-bold text-slate-800 text-sm mb-1">7天无理由退货</p>
                <p className="text-xs text-slate-500">未开封产品可申请</p>
              </div>
              <div className="text-center">
                <p className="text-2xl mb-2">💬</p>
                <p className="font-bold text-slate-800 text-sm mb-1">顾问全程服务</p>
                <p className="text-xs text-slate-500">购买前和使用中均可咨询</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/shipping" className="text-sm text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                查看完整配送与售后政策 →
              </Link>
            </div>
          </div>
        </section>

        {/* 合规说明 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg">⚖️</div>
            <h2 className="text-2xl font-bold text-slate-900">合规说明</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <ul className="space-y-3">
              {[
                "所有营养补充剂为膳食补充剂，不能替代药物或医生的专业治疗",
                "跨境产品符合产地国及中国的相关进口法规",
                "产品功效描述仅用于健康教育目的，不构成治疗承诺",
                "购买前建议结合自身情况或咨询顾问确认",
                "如有具体健康问题，请优先咨询医生或专业医疗人员",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 咨询入口 */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">还有疑问？联系荣旺健康顾问</h2>
          <p className="text-slate-300 text-sm mb-6 max-w-lg mx-auto">
            如对产品资质、授权、防伪或购买有任何疑问，请添加顾问微信或发送邮件。
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-white text-sm">
              📱 微信：rongwanghealth
            </div>
            <div className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-white text-sm">
              📧 support@rongwang.health
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
