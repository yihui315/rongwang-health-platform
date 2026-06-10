/**
 * UNCLE DARREN'S 品牌故事页
 * 路由：/brand
 * 内容来源：品牌册 OCR 提取（1970 Surrey 起源，MAK Pharma 合作，全球供应链）
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "品牌故事 | 1970 Uncle Darren's 恩科達倫",
  description:
    "1970年创始于英国Surrey，Uncle Darren's 恩科達倫专注精准营养，美国进口膳食补充剂，男女分开配方，科学配比。",
  alternates: {
    canonical: "https://rongwang.hk/brand",
  },
  openGraph: {
    title: "品牌故事 | 1970 Uncle Darren's 恩科達倫",
    description:
      "1970年创始于英国Surrey，Uncle Darren's 恩科達倫专注精准营养，男女分开配方，科学配比。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-6">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Our Story · Since 1970
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            UNCLE DARREN&rsquo;S
            <br />
            <span className="text-amber-400">恩科達倫</span>
          </h1>
          <p className="mt-6 text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            專注精準營養 · Focus On Precise Nutrition
          </p>
          <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            每個細胞都吃到專屬的營養。
            <br />
            以安全、有效、科學支援的靶向營養方案為核心。
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">品牌歷程</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-amber-500 to-slate-300" />

            {[
              {
                year: "1970",
                title: "起源於英國 Surrey",
                desc: "初期為本地教會醫院及福利機構提供營養配餐及營養制劑的定制服務。",
                emoji: "🇬🇧",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#ffffff" className="w-5 h-5"><circle cx="10" cy="10" r="7" fill="#1e3a8a"/><path d="M10 3C10 3 6 7 6 10" stroke="#ffffff" stroke-width="1.5"/><path d="M10 3C10 3 14 7 14 10" stroke="#ef4444" stroke-width="1.5"/><path d="M10 3V17" stroke="#ffffff" stroke-width="1.5"/></svg>`,
                side: "right",
              },
              {
                year: "1983",
                title: "開始營養制劑研製",
                desc: "從營養配餐走向標準化營養制劑，建立內部研發體系。",
                emoji: "🔬",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M7 3h6v3l2 3v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5l2-3V3z" stroke="#ffffff" stroke-width="1.5"/><circle cx="10" cy="9" r="1.5" fill="#ffffff"/></svg>`,
                side: "left",
              },
              {
                year: "1999",
                title: "與美國 MAK Pharma 合作",
                desc: "成為專業營養制劑的生產和研發企業，進入全球化發展階段。",
                emoji: "🇺🇸",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#ffffff" className="w-5 h-5"><circle cx="10" cy="10" r="7" fill="#1e40af"/><path d="M10 5v10M6 7l4 3-4 3M14 7l-4 3 4 3" stroke="#ffffff" stroke-width="1.2"/></svg>`,
                side: "right",
              },
              {
                year: "2000s",
                title: "全球供應鏈佈局",
                desc: "在美國、加拿大建立3大現代科技工廠，設立6個全球應用開發中心及科研實驗室。",
                emoji: "🌍",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#ffffff" className="w-5 h-5"><circle cx="10" cy="10" r="7" fill="#0369a1"/><path d="M3 10h14M10 3C10 3 6 7 6 10C6 13 10 17 10 17C10 17 14 13 14 10C14 7 10 3 10 3Z" fill="#22c55e" opacity="0.5"/></svg>`,
                side: "left",
              },
              {
                year: "Today",
                title: "暢銷全球主流零售渠道",
                desc: "走進 CVS Pharmacy（美國）、Well Pharmacy（英國/德國）、Rite Aid（澳洲）等主流健康連鎖。",
                emoji: "🏥",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="w-5 h-5"><rect x="3" y="5" width="14" height="12" rx="1" stroke="#ffffff" stroke-width="1.5"/><path d="M10 8v4M8 10h4" stroke="#ffffff" stroke-width="2"/></svg>`,
                side: "right",
              },
            ].map((item, i) => (
              <div key={item.year} className={`relative mb-10 flex items-center gap-8 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                {/* Spacer for alignment */}
                <div className="flex-1" />
                {/* Dot */}
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 shadow-lg">
                  <div dangerouslySetInnerHTML={{ __html: item.svgIcon || '' }} />
                </div>
                {/* Content card */}
                <div className="flex-1 max-w-sm">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-0.5 text-xs font-bold">
                      {item.year}
                    </span>
                    <h3 className="mt-2 font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing */}
      <section className="bg-white py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-3">
              Manufacturing Excellence
            </p>
            <h2 className="text-2xl font-bold text-slate-900">全球頂級供應鏈體系</h2>
            <p className="mt-2 text-slate-500 text-sm">
              從原材料到提取合成，從生產到包裝，從美國到全球
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-10 h-10"><rect x="4" y="20" width="40" height="20" rx="3" fill="#0d9488" opacity="0.15"/><rect x="4" y="20" width="40" height="20" rx="3" stroke="#0d9488" stroke-width="2"/><path d="M14 8L24 4L34 8V20H14V8Z" fill="#0d9488" opacity="0.2"/><path d="M14 8L24 4L34 8" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8V20H34V8" stroke="#0d9488" stroke-width="2"/><path d="M24 4V20" stroke="#0d9488" stroke-width="2"/><rect x="18" y="28" width="12" height="12" rx="1" fill="#0d9488" opacity="0.4"/></svg>`,
                title: "MAK Pharma",
                subtitle: "海外自有工廠",
                desc: "NSF、加拿大衛生部和 UL 批准的工廠，設施符合 cGMP 先決條件、行業 SOPs 標準。提供各種營養和定制化的生產、包裝、產品發布和供應鏈解決方案。",
                certs: ["NSF", "cGMP", "UL", "加拿大衛生部"],
              },
              {
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-10 h-10"><circle cx="24" cy="24" r="18" fill="#0d9488" opacity="0.12"/><circle cx="24" cy="24" r="18" stroke="#0d9488" stroke-width="2"/><path d="M16 24H32M24 16V32" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="24" r="5" fill="#0d9488" opacity="0.3"/></svg>`,
                title: "Medicap Laboratories",
                subtitle: "科技製藥生產商",
                desc: "專注於營養保健品和膳食補充劑的創新製造，與製藥 CMO 行業緊密合作，提供高品質定制化生產服務。",
                certs: ["GMP", "NSF"],
              },
              {
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-10 h-10"><circle cx="24" cy="24" r="18" fill="#0d9488" opacity="0.12"/><circle cx="24" cy="24" r="18" stroke="#0d9488" stroke-width="2"/><path d="M24 10C24 10 14 16 14 26C14 32 18 36 24 38C30 36 34 32 34 26C34 16 24 10 24 10Z" fill="#0d9488" opacity="0.25"/><path d="M24 10C24 10 14 16 14 26C14 32 18 36 24 38" stroke="#0d9488" stroke-width="2"/><path d="M24 10C24 10 34 16 34 26C34 32 30 36 24 38" stroke="#0d9488" stroke-width="2"/></svg>`,
                title: "全球原料供應商",
                subtitle: "美國 · 英國 · 加拿大",
                desc: "精選全球頂級原料供應商，涵蓋專利成分、純天然提取物和專有配方原料，從源頭把控品質。",
                certs: ["FDA", "TGA", "HALAL"],
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="mb-3" dangerouslySetInnerHTML={{ __html: item.svgIcon }} />
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.certs.map((cert) => (
                    <span key={cert} className="rounded-full bg-teal-50 text-teal-700 px-2.5 py-0.5 text-xs font-semibold border border-teal-100">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">國際權威認證</h2>
            <p className="mt-2 text-slate-500 text-sm">多國監管部門認證，安全品質有保障</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: "FDA", country: "美國", desc: "食品藥品監督管理局" },
              { name: "TGA", country: "澳洲", desc: "治療商品管理局" },
              { name: "NPN", country: "加拿大", desc: "天然健康產品認證" },
              { name: "HALAL", country: "國際", desc: "清真認證" },
              { name: "GMP", country: "美國", desc: "良好生產規範" },
              { name: "NSF", country: "美國", desc: "公共健康安全認證" },
            ].map((cert) => (
              <div key={cert.name} className="flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white p-4">
                <span className="text-2xl font-black text-slate-800">{cert.name}</span>
                <span className="text-xs text-slate-400 mt-1">{cert.country}</span>
                <span className="text-xs text-slate-500 mt-1 leading-snug">{cert.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Retail */}
      <section className="bg-slate-900 py-16 px-6 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Global Retail Network
          </p>
          <h2 className="text-2xl font-bold">暢銷全球主流健康連鎖</h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "CVS Pharmacy", country: "🇺🇸 美國" },
              { name: "Well Pharmacy", country: "🇬🇧 英國" },
              { name: "Snell's Pharmacy", country: "🇨🇦 加拿大" },
              { name: "Well Pharmacy", country: "🇩🇪 德國" },
              { name: "Rite Aid", country: "🇦🇺 澳洲" },
            ].map((store) => (
              <div key={store.name} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <p className="font-bold text-white">{store.name}</p>
                <p className="text-xs text-slate-400 mt-1">{store.country}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precision Nutrition Philosophy */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">精準營養哲學</h2>
            <p className="mt-2 text-slate-500 text-sm">
              為不同年齡、不同性別、不同需求的消費者定制專屬營養
            </p>
          </div>

          {/* Gender difference explainer */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">為什麼需要性別定制？</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-amber-400 text-sm font-bold mb-2">男性生理特點</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  男性與女性的營養需求存在差異。男性日常活動量大，應酬饮酒較多，
                  營養消耗和生活壓力也相對較大，需要更針對性的營養支持方案。
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-pink-400 text-sm font-bold mb-2">女性生理特點</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  女性在不同生理階段有著獨特的營養需求，需要根據年齡和生活階段
                  調整營養補充方案，支持日常骨骼、心血管和內分泌健康。
                </p>
              </div>
            </div>
          </div>

          {/* Four capsule technologies */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">四大膠囊技術</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "冷壓破壁技術",
                  desc: "保持成分的高活性，生物利用度提升40%，小分子更容易吸收",
                  svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 6V20M20 20L12 12M20 20L28 12" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="20" r="14" stroke="#3b82f6" stroke-width="2" opacity="0.3"/></svg>`,
                  color: "bg-blue-50 border-blue-200",
                },
                {
                  title: "速釋外層",
                  desc: "茶氨酸+維生素B群，打開營養通道，快速起效",
                  svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M8 20H32M20 8V32" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="20" r="12" stroke="#f59e0b" stroke-width="2" opacity="0.3"/></svg>`,
                  color: "bg-amber-50 border-amber-200",
                },
                {
                  title: "MCT緩釋技術",
                  desc: "持續支援全天營養供給，長效釋放",
                  svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><rect x="8" y="12" width="24" height="16" rx="3" stroke="#22c55e" stroke-width="2"/><path d="M14 20H26" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/><rect x="8" y="12" width="24" height="16" rx="3" fill="#22c55e" opacity="0.15"/></svg>`,
                  color: "bg-green-50 border-green-200",
                },
                {
                  title: "Liposome 脂質體包埋",
                  desc: "多點分階段釋放，對抗胃酸過早分解",
                  svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><circle cx="20" cy="20" r="12" stroke="#a855f7" stroke-width="2"/><circle cx="20" cy="20" r="7" stroke="#a855f7" stroke-width="2" opacity="0.5"/><circle cx="20" cy="20" r="3" fill="#a855f7" opacity="0.4"/></svg>`,
                  color: "bg-purple-50 border-purple-200",
                },
              ].map((tech) => (
                <div key={tech.title} className={`rounded-xl border p-4 ${tech.color} flex flex-col items-center text-center hover:shadow-md transition-shadow`}>
                  <div dangerouslySetInnerHTML={{ __html: tech.svgIcon }} className="mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">{tech.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Lines */}
      <section className="bg-white py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">四大核心產品線</h2>
            <p className="mt-2 text-slate-500 text-sm">男女分開配方，精準靶向</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
                {
                  name: "Heart Defender",
                  desc: "心臟 / 血管 / 血脂營養支持",
                  detail: "輔酶Q10 + Omega3 + 大蒜精 + 鎂，支持心血管系統的日常營養管理。",
                  color: "from-red-500 to-rose-600",
                  lightBg: "bg-red-50",
                  accent: "text-red-600",
                  tags: ["輔酶Q10", "Omega3", "大蒜精", "鎂"],
                },
                {
                  name: "Joint Guardian Plus",
                  desc: "關節 / 骨骼營養支持",
                  detail: "氨基葡萄糖 + 軟骨素 + 膠原蛋白 + MSM，支持關節日常舒適度與骨骼營養。",
                  color: "from-emerald-500 to-teal-600",
                  lightBg: "bg-emerald-50",
                  accent: "text-emerald-600",
                  tags: ["氨基葡萄糖", "軟骨素", "膠原蛋白", "MSM"],
                },
                {
                  name: "Digestive Elite Care",
                  desc: "腸道動力 / 消化健康支持",
                  detail: "10大天然成分：益生菌 + 消化酶 + 膳食纖維，支持腸道日常菌群平衡與消化功能。",
                  color: "from-sky-500 to-blue-600",
                  lightBg: "bg-sky-50",
                  accent: "text-sky-600",
                  tags: ["15菌株益生菌", "消化酶", "膳食纖維", "牛至提取物"],
                },
                {
                  name: "Brain Boost Max",
                  desc: "腦活力 / 認知與神經營養支持",
                  detail: "DHA + PS磷脂酰絲氨酸 + 核桃提取物 + 氨基化合物，多種成分配合支持日常認知功能。",
                  color: "from-violet-500 to-purple-600",
                  lightBg: "bg-violet-50",
                  accent: "text-violet-600",
                  tags: ["DHA", "PS", "核桃提取物", "氨基化合物"],
                },
            ].map((line) => (
              <div key={line.name} className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className={`bg-gradient-to-br ${line.color} p-5`}>
                  <h3 className="font-bold text-white text-lg">{line.name}</h3>
                  <p className="text-white/70 text-sm mt-1">{line.desc}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{line.detail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {line.tags.map((tag) => (
                      <span key={tag} className={`rounded-full ${line.lightBg} ${line.accent} px-2.5 py-0.5 text-xs font-semibold`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Products */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              {
                name: "UNC-45",
                desc: "細胞能量代謝營養支持",
                detail: "美國德州大學獨家成分授權，支持細胞能量代謝的日常營養需求。",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" class="w-10 h-10"><path d="M20 36C20 36 6 26 6 16C6 10.477 10.477 6 16 6C18.5 6 20 8 20 8C20 8 21.5 6 24 6C29.523 6 34 10.477 34 16C34 26 20 36 20 36Z" fill="#ef4444" opacity="0.15"/><path d="M20 36C20 36 6 26 6 16C6 10.477 10.477 6 16 6C18.5 6 20 8 20 8" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/><path d="M20 8C20 8 21.5 6 24 6C29.523 6 34 10.477 34 16C34 26 20 36 20 36" stroke="#ef4444" stroke-width="2"/></svg>`,
              },
              {
                name: "PLATINUM+",
                desc: "細胞能量 / 線粒體 / NAD+ 營養支持",
                detail: "6大核心成分：NMN + NADH + 輔酶Q10 + 白藜蘆醇+ 維生素E + 蝦青素，支持細胞能量代謝與抗氧化營養補充。",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" class="w-10 h-10"><circle cx="20" cy="20" r="14" fill="#f59e0b" opacity="0.12"/><circle cx="20" cy="20" r="14" stroke="#f59e0b" stroke-width="2"/><path d="M14 20H26M20 14V26" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="20" r="4" fill="#f59e0b" opacity="0.3"/></svg>`,
              },
              {
                name: "BrainBoost Essence",
                desc: "兒童 / 青少年腦部營養支持",
                detail: "3維度：營養支持 + 日常保養 + 持續補充。DHA + PS + 核桃粉 + 維生素B12，支持日常記憶力和視力發育的營養需求。",
                svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" class="w-10 h-10"><circle cx="20" cy="20" r="14" fill="#0d9488" opacity="0.12"/><circle cx="20" cy="20" r="14" stroke="#0d9488" stroke-width="2"/><path d="M12 20C12 20 15 14 20 14C25 14 28 20 28 20" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/><path d="M12 20C12 20 15 26 20 26C25 26 28 20 28 20" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/></svg>`,
              },
            ].map((p) => (
              <div key={p.name} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow items-center">
                <div dangerouslySetInnerHTML={{ __html: p.svgIcon }} className="flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-500 py-14 px-6 text-center">
        <h2 className="text-2xl font-bold text-white">開始您的精準營養之旅</h2>
        <p className="mt-3 text-amber-100 max-w-md mx-auto text-sm">
          基於50餘年的營養科學研究，UNCLE DARREN&rsquo;S 為您定制專屬健康方案
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/products/category/heart"
            className="rounded-full bg-white px-6 py-3 font-bold text-amber-600 hover:bg-amber-50 transition-colors"
          >
            查看心臟系列
          </Link>
          <Link
            href="/products/category/brain"
            className="rounded-full bg-white px-6 py-3 font-bold text-amber-600 hover:bg-amber-50 transition-colors"
          >
            查看大腦系列
          </Link>
          <Link
            href="/"
            className="rounded-full border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10 transition-colors"
          >
            返回官網首頁
          </Link>
        </div>
      </section>
    </main>
  );
}