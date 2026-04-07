import { testimonials, stats } from "@/data/testimonials";

export default function TestimonialsSection() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">真实用户反馈</h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-3xl border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3.5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-dark text-lg font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold">
                    {t.name} · {t.age}岁
                  </div>
                  <div className="text-sm text-slate-500">
                    {t.location} · 购买{t.plan}
                  </div>
                </div>
              </div>
              <div className="mb-3 text-amber-400" style={{ letterSpacing: "2px" }}>
                {"★".repeat(t.rating)}
              </div>
              <p className="leading-7 text-slate-600">{t.text}</p>
              <div className="mt-4 text-xs font-semibold text-teal">
                ✅ 已验证购买
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-7 text-center"
            >
              <div className="text-4xl font-black text-teal">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
