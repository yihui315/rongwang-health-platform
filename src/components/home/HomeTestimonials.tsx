import {
  testimonials,
  type Testimonial,
} from "@/lib/home/home-content";

const accentMap: Record<Testimonial["accent"], string> = {
  pink: "bg-pink-50 text-pink-700",
  blue: "bg-sky-50 text-sky-700",
  purple: "bg-violet-50 text-violet-700",
  green: "bg-emerald-50 text-emerald-700",
};

/**
 * 用户反馈 —— 3 条简洁评价卡，避免夸张表达。
 */
export default function HomeTestimonials() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          他们的真实反馈
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-emerald-100 hover:shadow-md"
            >
              <blockquote className="text-sm leading-relaxed text-slate-600">
                {`“${t.quote}”`}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${accentMap[t.accent]}`}
                >
                  {t.initial}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.meta}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
