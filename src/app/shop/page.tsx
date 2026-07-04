/**
 * 荣旺健康 · 商城主页
 * 拼多多官方旗舰店
 */

import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "購買渠道 | 荣旺健康",
  description: "正品保障 · 官方授权渠道购买1970 Uncle Darren's营养保健品，认准拼多多榮旺健康海外專營店。",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rongwang.hk'}/shop` },
};

const platforms = [
  {
    id: "pinduoduo",
    name: "拼多多",
    storeName: "榮旺健康海外專營店",
    badge: "正品保障",
    color: "red",
    colorFrom: "from-red-50",
    colorTo: "to-orange-50",
    borderColor: "border-red-100",
    iconBg: "bg-red-500",
    iconText: "拼",
    rating: "4.8",
    sales: "5,000+",
    cta: "进店购买",
    url: "https://mobile.yangkeduo.com/mall_page.html?mall_id=516573367",
    features: [
      "官方认证海外旗舰店",
      "假一罰十 · 正品保障",
      "全场包邮 · 极速发货",
    ],
  },
  {
    id: "jd",
    name: "京东国际",
    storeName: "榮旺健康海外官方旗舰店",
    badge: "京东自营",
    color: "blue",
    colorFrom: "from-blue-50",
    colorTo: "to-sky-50",
    borderColor: "border-blue-100",
    iconBg: "bg-blue-500",
    iconText: "京",
    rating: "4.7",
    sales: "3,000+",
    cta: "进店购买",
    url: "https://mall.jd.com/index-1000294896.html",
    features: [
      "京东自营 · 正品保障",
      "京东物流 · 极速配送",
      "京东售后 · 7天无忧退",
    ],
  },
  {
    id: "tmall",
    name: "天猫国际",
    storeName: "榮旺健康海外旗舰店",
    badge: "官方直营",
    color: "orange",
    colorFrom: "from-orange-50",
    colorTo: "to-yellow-50",
    borderColor: "border-orange-100",
    iconBg: "bg-orange-500",
    iconText: "猫",
    rating: "4.9",
    sales: "2,000+",
    cta: "进店购买",
    url: "https://chaoshi.tmall.com/search",
    features: [
      "天猫官方保障 · 正品溯源",
      "支付宝担保交易 · 安全支付",
      "7天无理由退换货",
    ],
  },
];

function ShieldBadgeIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3L5 9V17C5 25.5 11.5 33.5 20 36C28.5 33.5 35 25.5 35 17V9L20 3Z" fill="currentColor" opacity="0.15"/>
      <path d="M20 5L7 10V17C7 24.5 12.5 31.5 20 34C27.5 31.5 33 24.5 33 17V10L20 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 20L18 23L25 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PlatformCard({ platform }: { platform: typeof platforms[0] }) {
  const colorMap: Record<string, string> = {
    red: "text-red-500",
    blue: "text-blue-600",
    orange: "text-orange-500",
  };

  return (
    <div
      className={`group relative rounded-2xl bg-gradient-to-br ${platform.colorFrom} ${platform.borderColor} border p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}
    >
      {/* Shield Badge Icon */}
      <div className={`absolute -top-5 left-1/2 -translate-x-1/2 ${colorMap[platform.color]}`}>
        <ShieldBadgeIcon />
      </div>

      {/* 平台头部 */}
      <div className="mb-5 flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${platform.iconBg} shadow-md`}
          >
            <span className="text-white text-lg font-bold">{platform.iconText}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{platform.name}</h3>
            <p className="text-sm text-slate-500">{platform.storeName}</p>
          </div>
        </div>
        <span
          className={`rounded-full bg-${platform.color}-100 px-3 py-1 text-xs font-semibold text-${platform.color}-700`}
        >
          {platform.badge}
        </span>
      </div>

      {/* 数据指标 */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/80 p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{platform.rating}</p>
          <p className="text-xs text-slate-500">店铺评分</p>
        </div>
        <div className="rounded-xl bg-white/80 p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{platform.sales}</p>
          <p className="text-xs text-slate-500">累计銷量</p>
        </div>
      </div>

      {/* 特色服务 */}
      <div className="mb-5 space-y-2">
        {platform.features.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 flex-shrink-0 text-${platform.color}-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-slate-600">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA按钮 */}
      <a
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-xl ${platform.color === "red" ? "bg-red-500 hover:bg-red-600" : platform.color === "blue" ? "bg-blue-500 hover:bg-blue-600" : "bg-orange-500 hover:bg-orange-600"} text-center py-3 text-sm font-semibold text-white transition shadow-sm`}
      >
        {platform.cta} →
      </a>
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* 页面头部 */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">官方購買渠道</h1>
          <p className="mt-3 text-slate-500">
            1970 Uncle Darren's 营养产品正品授权销售，全渠道假一罰十
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["正品保障", "官方授权", "全程包邮"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
          {/* 邮箱捕获 */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-sm text-slate-500 mb-2">关注公众号，获取专属优惠和健康资讯</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="输入邮箱，领取9折券"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white text-sm font-semibold rounded-lg transition"
              >
                领取
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 平台选择区 */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {platforms.map((p) => (
            <PlatformCard key={p.id} platform={p} />
          ))}
        </div>
      </section>

      {/* 紧迫感Banner */}
      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-center text-white">
          <p className="text-lg font-bold">新客户首单额外9折</p>
          <p className="text-sm opacity-90 mt-1">联系客服报"官网"领取专属优惠码</p>
        </div>
      </section>

      {/* 购买须知 */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">購買須知</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700">海關清關說明</p>
                <p className="text-sm text-slate-500">
                 跨境保健品需要海關清關，請如實填寫收件人真實身份信息（姓名+身份證號），否則無法通關。
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700">進口保健食品說明</p>
                <p className="text-sm text-slate-500">
                  本平台銷售之保健品均為進口產品，包裝如實標示成分、產地及有效期，請仔細閱讀產品說明。
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700">正品驗證方法</p>
                <p className="text-sm text-slate-500">
                  請認準「榮旺健康」品牌授權標識，掃描產品包裝上的防偽碼驗證真偽。
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700">退換貨說明</p>
                <p className="text-sm text-slate-500">
                  跨境商品不支持七天無理由退貨，收到商品後如有品質問題，請在48小時內聯繫客服處理。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
