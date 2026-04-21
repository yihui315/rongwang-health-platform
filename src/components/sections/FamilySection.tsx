import Link from "next/link";
import Image from "next/image";

const familyCards = [
  { label: '父母档案', desc: '关注心血管与骨密度', iconPath: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { label: '配偶档案', desc: '均衡营养与压力管理', iconPath: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { label: '孩子档案', desc: '成长期营养与免疫', iconPath: 'M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z' },
  { label: '家庭月报', desc: '全家健康一目了然', iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
];

const lifeImages = [
  { src: '/images/life/life-morning.png', label: '晨间活力' },
  { src: '/images/life/life-office.png', label: '办公效率' },
  { src: '/images/life/life-outdoor.png', label: '户外运动' },
  { src: '/images/life/life-sleep.png', label: '安稳睡眠' },
];

export default function FamilySection() {
  return (
    <section className="py-20 md:py-24 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Life images row — lifestyle visual strip */}
        <div className="mb-16 grid grid-cols-4 gap-3 max-w-5xl mx-auto">
          {lifeImages.map((img) => (
            <div key={img.label} className="relative rounded-2xl overflow-hidden h-32 md:h-40 group">
              <Image src={img.src} alt={img.label} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-white/90">{img.label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50 px-3 py-1 text-[12px] font-semibold text-slate-600 mb-5">
              <svg className="h-3.5 w-3.5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              家庭健康
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              一套账号，
              <br />
              管理全家健康
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500 max-w-md">
              为每位家庭成员建立独立档案——分别检测、分别推荐、统一管理。不只照顾自己，也能一起照顾父母、配偶和孩子。
            </p>
            <Link
              href="/family"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-[14px] font-semibold text-white hover:bg-slate-800 transition-all shadow-sm hover:shadow-md group"
            >
              了解家庭健康计划
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="grid gap-3 sm:grid-cols-2">
              {familyCards.map((card) => (
                <div key={card.label} className="group rounded-xl bg-white border border-slate-200/60 p-4 hover:shadow-sm hover:border-slate-300/60 transition-all">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-teal-50 transition-colors">
                    <svg className="h-4.5 w-4.5 text-slate-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.iconPath} />
                    </svg>
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-900">{card.label}</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
