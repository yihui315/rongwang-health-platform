/**
 * 荣旺健康 · 1970 Uncle Darren's 品牌官网首页
 *
 * 设计参考：营养工厂微信小程序 + 京东品牌旗舰店
 * 核心逻辑：品牌展示 → 品类导航 → 營養包套裝 → 单品热卖 → 信任背书
 * 目标：直接承接自然流量，促成购买决策（不做测评拦截）
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import HomeIcon from "@/components/home/HomeIcon";
import HomeTrustBar from "@/components/home/HomeTrustBar";
import {
  healthDirections1970,
  bundleProducts,
  hotSingleProducts,
  heroBadges1970,
  testimonials1970,
  brandStory1970,
  faqs1970,
} from "@/lib/home/home-content-1970";

// ============================================================
// 子组件
// ============================================================

/** 顶部导航栏 */
function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo区 */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-slate-900">
            1970 Uncle Darren&apos;s
          </span>
          <span className="hidden text-xs font-normal text-slate-400 sm:block">
            荣旺健康独家代理
          </span>
        </div>

        {/* 一级导航 */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: "心臟健康", href: "/products/category/heart" },
            { label: "骨骼健康", href: "/products/category/bone" },
            { label: "腸道健康", href: "/products/category/gut" },
            { label: "腦力提升", href: "/products/category/brain" },
            { label: "全部產品", href: "/products" },
            { label: "品牌故事", href: "/brand" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右侧操作 */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="購物車"
          >
            <HomeIcon name="layers" className="h-5 w-5" />
          </Link>
          <Link
            href="/auth/login"
            className="hidden rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:block"
          >
            登錄
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            註冊
          </Link>
        </div>
      </div>
    </header>
  );
}

/** 主Banner区 */
function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 品牌主视觉背景图 */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero/homepage-hero_001.jpg"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
      </div>

      {/* 装饰性背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16,185,129,0.4), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* 左侧：品牌主张 */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              美國原瓶進口 · 专注中老年健康
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-[2.6rem] lg:leading-[1.15]">
              1970 Uncle Darren&apos;s
              <br />
              <span className="text-emerald-400">恩科达伦</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              源自美国的專業營養品牌，由资深药剂化学家 Darren 创立于1970年代，
              专注心脏、骨骼、肠道、脑力四大健康領域，为中老年人群提供科學配比的进口营养补充剂。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ai-consult"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
              >
                立即 AI 評估健康
                <span aria-hidden>→</span>
              </Link>
              <span className="flex items-center gap-2 px-3 py-3 text-sm text-slate-400">
                或 <Link href="/solutions" className="text-slate-300 underline hover:text-white">查看健康方案</Link>
              </span>
            </div>

            {/* 信任徽章 */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {heroBadges1970.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400"
                >
                  <HomeIcon
                    name="shield-check"
                    className="h-3.5 w-3.5 text-emerald-500"
                  />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧：品牌故事卡片 */}
          <div className="hidden lg:block">
            <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/50 p-7 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-400">
                  <HomeIcon name="shield-heart" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">品牌创始</p>
                  <p className="text-sm text-slate-400">1970年代 · 美国</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-300">
                <p>
                  Darren 是一位擁有40年經驗的臨床藥劑師，
在目睹無數患者因營養不均衡導致慢性病後，
                  決定創立一個「只做有效成分、不做營銷溢價」的專業營養品牌。
                </p>
                <p>
每一款產品都經過 Darren 親自配方調試，
                  與美國頂級原料商（Chemi Nutra、Basf）合作，
                  確保每一粒膠囊的含量與釋放率都達到製藥標準。
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/50 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">50+</p>
                  <p className="text-xs text-slate-400">年研發歷史</p>
                </div>
                <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/50 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">4大</p>
                  <p className="text-xs text-slate-400">健康領域</p>
                </div>
                <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/50 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">美国</p>
                  <p className="text-xs text-slate-400">原裝進口</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 首页信任区 —— Hero 下方 */
function TrustSectionWrapper() {
  return <HomeTrustBar />;
}

/** 品类导航入口 */
function CategoryNav() {
  // SVG pill badge icons for each category (teal color scheme)
  const categoryIcons: Record<string, React.ReactNode> = {
    heart: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 28C16 28 4 20 4 11C4 7 7 4 11 4C13.5 4 15.5 5.5 16 7C16.5 5.5 18.5 4 21 4C25 4 28 7 28 11C28 20 16 28 16 28Z" fill="#14b8a6" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11L14 14L16 11L18 14L20 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bone: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 14C8 14 6 12 6 10C6 8 8 6 10 6C12 6 14 8 14 10C14 12 12 14 12 14" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 14C20 14 22 12 22 10C22 8 20 6 18 6C16 6 14 8 14 10C14 12 16 14 16 14" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 18C8 18 10 26 16 26C22 26 24 18 24 18" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="9" r="2" fill="#14b8a6"/>
        <circle cx="23" cy="9" r="2" fill="#14b8a6"/>
        <circle cx="9" cy="23" r="2" fill="#14b8a6"/>
        <circle cx="23" cy="23" r="2" fill="#14b8a6"/>
      </svg>
    ),
    gut: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="16" rx="10" ry="12" fill="#14b8a6" opacity="0.2"/>
        <ellipse cx="16" cy="16" rx="10" ry="12" stroke="#14b8a6" strokeWidth="2"/>
        <path d="M12 10C12 10 14 14 16 14C18 14 20 10 20 10" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 16C10 16 13 20 16 20C19 20 22 16 22 16" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 22C12 22 14 24 16 24C18 24 20 22 20 22" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    brain: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 28C20 28 24 24 24 18C24 14 22 10 20 8C22 6 24 4 24 4C24 4 22 6 20 8C18 6 16 6 16 6C16 6 14 6 12 8C10 6 8 4 8 4C8 4 10 6 12 8C10 10 8 14 8 18C8 24 12 28 16 28Z" fill="#14b8a6" opacity="0.2"/>
        <path d="M16 26C19 26 22 23 22 18C22 14 20 11 18 9" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 26C13 26 10 23 10 18C10 14 12 11 14 9" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M13 12C13 12 14 14 16 14C18 14 19 12 19 12" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="13" cy="17" r="1.5" fill="#14b8a6"/>
        <circle cx="19" cy="17" r="1.5" fill="#14b8a6"/>
      </svg>
    ),
  };

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {healthDirections1970.map((dir) => (
            <Link
              key={dir.slug}
              href={dir.href}
              className="group relative flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center transition hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100"
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-teal-100 transition-transform group-hover:scale-110 sm:h-16 sm:w-16"
                style={{ border: "2px solid #14b8a6" }}
              >
                {categoryIcons[dir.slug]}
              </div>
              <p className="font-semibold text-slate-900">{dir.title}</p>
              <p className="mt-1 text-xs text-slate-400">{dir.subtitle}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {dir.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 營養包套裝区 */
function BundleSection() {
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 区块标题 */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">科學配比 · 協同增效</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              營養師推薦套裝
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              基於 decades of research 研發的黃金配比組合，
              针对男女不同體質定制，每日一袋，28天持续补充周期。
            </p>
          </div>
          <Link
            href="/products/bundles"
            className="hidden text-sm font-medium text-emerald-600 transition hover:text-emerald-700 sm:block"
          >
            查看全部套裝 →
          </Link>
        </div>

        {/* 套裝卡片 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bundleProducts.map((bundle) => (
            <Link
              key={bundle.slug}
              href={bundle.href}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100"
            >
              {/* 产品图 */}
              <div className="mb-3 h-32 w-full flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                  src={bundle.image}
                  alt={bundle.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* 标签 */}
              <div className="mb-3 flex gap-2">
                <span
                  className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: bundle.accentColor }}
                >
                  {bundle.gender === "male" ? "男士" : "女士"}
                </span>
                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                  套裝
                </span>
              </div>

              {/* 产品名 */}
              <h3 className="font-semibold text-slate-900">{bundle.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{bundle.spec}</p>

              {/* 包含成分 */}
              <div className="mt-3 flex flex-wrap gap-1">
                {bundle.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                  >
                    {ing}
                  </span>
                ))}
              </div>

              {/* 价格 */}
              <div className="mt-auto flex items-end justify-between pt-4">
                <div>
                  <p className="text-xs text-slate-400 line-through">
                    市場價 ¥{bundle.marketPrice}
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    ¥{bundle.price}
                    <span className="text-xs font-normal text-slate-400">/套</span>
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  立即選購
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/products/bundles"
            className="text-sm font-medium text-emerald-600"
          >
            查看全部套裝 →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 单品热卖区 */
function HotProductsSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">明星單品 · 爆款熱賣</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              單品熱賣榜
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-medium text-emerald-600 transition hover:text-emerald-700 sm:block"
          >
            全部單品 →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hotSingleProducts.map((product, i) => (
            <Link
              key={product.slug}
              href={product.href}
              className="group relative flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-emerald-200 hover:shadow-md"
            >
              {/* 排名标签 */}
              <div
                className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  backgroundColor:
                    i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c32" : "#e2e8f0",
                  color: i < 3 ? "white" : "#64748b",
                }}
              >
                {i + 1}
              </div>

              {/* 产品图 */}
              <div className="h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:h-28 sm:w-28">
                {/* 占位图 */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <span className="text-3xl">{product.emoji}</span>
                </div>
              </div>

              {/* 产品信息 */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-400">{product.category}</p>
                  <h3 className="mt-0.5 font-semibold text-slate-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                    {product.tags.join(" · ")}
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">¥{product.price}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-slate-400 line-through">
                        ¥{product.originalPrice}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                    查看
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 品牌背书区 — 為什麼選擇 */
function TrustSection() {
  const trustPoints = [
    {
      svg: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
          <rect width="48" height="48" rx="12" fill="#0d9488" fillOpacity="0.15"/>
          <path d="M24 42s14-5.6 14-15.75V11.2L24 7 10 11.2V26.25C10 36.4 24 42 24 42Z" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m17 24 5 5 9-9" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "美國原裝進口",
      desc: "每一瓶均在美國生產，原瓶直郵，附带進口檢驗檢疫證明",
    },
    {
      svg: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
          <rect width="48" height="48" rx="12" fill="#0d9488" fillOpacity="0.15"/>
          <path d="m12 36 8-8 4 4 8-8" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M36 24v6a4 4 0 0 1-4 4H16" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="36" cy="12" r="4" stroke="#14b8a6" strokeWidth="2"/>
          <path d="M36 16v4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "原料溯源",
      desc: "與美國頂級原料商 Chemi Nutra、BASF、IFF 合作，原料可追溯",
    },
    {
      svg: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
          <rect width="48" height="48" rx="12" fill="#0d9488" fillOpacity="0.15"/>
          <path d="M10 14v10a6 6 0 0 0 12 0V14" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 14v4a6 6 0 0 0 12 0v-4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="34" cy="18" r="3" stroke="#14b8a6" strokeWidth="2"/>
          <path d="M26 36v-8" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 36v-5a4 4 0 0 1 4-4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 36v-3a4 4 0 0 1 4-4h0" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "第三方檢測",
      desc: "每一批次均通過 SGS/Intertek 第三方檢測，不合格不出庫",
    },
    {
      svg: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
          <rect width="48" height="48" rx="12" fill="#0d9488" fillOpacity="0.15"/>
          <path d="M24 40s10-4.4 10-13.2V10L24 7 14 10v16.8C14 35.6 24 40 24 40Z" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M24 28s-4 2.4-4 5.4a4 4 0 0 0 4 4 4 4 0 0 0 4-4c0-3-4-5.4-4-5.4Z" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 40v-4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M28 40v-4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "專業配方",
      desc: "由 Darren 親自調試配方，确保成分協同與生物利用度",
    },
  ];

  return (
    <section className="bg-slate-900 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-emerald-400">品质承诺</p>
          <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            為什麼選擇 1970 Uncle Darren&apos;s
          </h2>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="flex flex-col items-center text-center"
            >
              <div className="transition-transform hover:scale-105">{point.svg}</div>
              <h3 className="mt-5 font-semibold text-white">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 用戶評價区 */
function TestimonialsSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-emerald-600">真实反馈</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            用户真实评价
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials1970.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {t.initial}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.meta}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-3 text-xs text-emerald-600 font-medium">
                购买产品：{t.product}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 品牌故事CTA */
function BrandStoryCTA() {
  return (
    <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {brandStory1970.title}
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-slate-600">
          {brandStory1970.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/brand"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            阅读完整品牌故事
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            瀏覽全部產品
          </Link>
        </div>
      </div>
    </section>
  );
}

/** FAQ区 */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-12 sm:py-16" id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            常見問題
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {faqs1970.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white transition-all hover:border-emerald-200 hover:shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="pr-4 font-medium text-slate-900">{faq.q}</span>
                <span
                  className={`ml-3 flex-shrink-0 text-slate-400 transition-transform duration-200 ${openIndex === i ? "rotate-180 text-emerald-500" : ""}`}
                >
                  ↓
                </span>
              </button>
              {openIndex === i && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-500">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 主页面组装
function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* 品牌 */}
          <div>
            <p className="font-bold text-slate-900">1970 Uncle Darren&apos;s</p>
            <p className="mt-2 text-sm text-slate-500">
              荣旺健康战略合作品牌，美國原瓶進口营养补充剂，专注中老年四大健康領域。
            </p>
          </div>

          {/* 产品 */}
          <div>
            <p className="font-semibold text-slate-900">產品分類</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {[
                { label: "心臟健康", href: "/products/category/heart" },
                { label: "骨骼健康", href: "/products/category/bone" },
                { label: "腸道健康", href: "/products/category/gut" },
                { label: "腦力提升", href: "/products/category/brain" },
                { label: "全部產品", href: "/products" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司 */}
          <div>
            <p className="font-semibold text-slate-900">关于我们</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {[
                { label: "品牌故事", href: "/brand" },
                { label: "资质证书", href: "/brand#certifications" },
                { label: "媒体报道", href: "/brand#global" },
                { label: "聯繫我們", href: "/shipping" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 合规 */}
          <div>
            <p className="font-semibold text-slate-900">购物保障</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {[
                { label: "隱私政策", href: "/privacy" },
                { label: "服務條款", href: "/terms" },
                { label: "退货政策", href: "/shipping#returns" },
                { label: "防伪查询", href: "/brand#certifications" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部声明 */}
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs leading-relaxed text-slate-400">
            本网站所售产品为美国原产膳食补充剂，依据原产国标准生产。
            本品不能替代药物，不用于诊断、治疗、治愈或预防任何疾病。
            商品符合原产国法规，可能与中国国家标准存在差异，跨境购买前请知悉。
            如正在服用处方药或有任何健康问题，请咨询医生后再使用。
          </p>
          <p className="mt-3 text-xs text-slate-400">
            © {new Date().getFullYear()} 荣旺健康 Rongwang Health. 保留所有權利.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// 主页面组装
// ============================================================

/**
 * 1970 Uncle Darren's 品牌官网首页
 *
 * 整体结构：
 * 1. TopNav - 顶部导航
 * 2. HeroBanner - 品牌主Banner
 * 3. CategoryNav - 四大品类入口
 * 4. BundleSection - 營養包套裝区
 * 5. HotProductsSection - 单品热卖区
 * 6. TrustSection - 品牌背书
 * 7. TestimonialsSection - 用戶評價
 * 8. BrandStoryCTA - 品牌故事CTA
 * 9. FAQSection - 常見問題
 * 10. Footer
 */
export default function HomePage1970() {
  return (
    <div className="bg-white text-slate-900">
      <TopNav />
      <HeroBanner />
      <TrustSectionWrapper />
      <CategoryNav />
      <BundleSection />
      <HotProductsSection />
      <TrustSection />
      <TestimonialsSection />
      <BrandStoryCTA />
      <FAQSection />
      <Footer />
    </div>
  );
}
