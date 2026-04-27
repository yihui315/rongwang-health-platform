import Link from 'next/link';
import { notFound } from 'next/navigation';
import { landingPages, getLandingPage } from '@/data/landing-pages';

export function generateStaticParams() {
  return landingPages.map((lp) => ({ slug: lp.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const lp = getLandingPage(slug);
  if (!lp) return { title: '荣旺健康' };
  return {
    title: lp.content.metaTitle,
    description: lp.content.metaDescription,
  };
}

/** i18n section headers — auto-detect from slug prefix */
const i18n = {
  zh: {
    painTitle: '这些问题，你是不是也有？',
    benefitsTitle: '为什么选择荣旺健康',
    stepsTitle: '3 步开始',
    faqTitle: '常见问题',
  },
  en: {
    painTitle: 'Sound Familiar?',
    benefitsTitle: 'Why Rongwang Health',
    stepsTitle: '3 Simple Steps',
    faqTitle: 'Frequently Asked Questions',
  },
};

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const lp = getLandingPage(slug);
  if (!lp) notFound();
  const c = lp.content;
  const t = slug.startsWith('en-') ? i18n.en : i18n.zh;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50 px-6 py-24">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full border border-teal-200 bg-white/80 px-4 py-1 text-sm font-medium text-teal-700">
            {c.hero.eyebrow}
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-tight text-slate-900">
            {c.hero.title}
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">{c.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/ai-consult"
              className="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white px-8 py-4 font-semibold shadow-xl shadow-teal-500/30 hover:-translate-y-0.5 transition"
            >
              {c.hero.ctaPrimary} →
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {c.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">{t.painTitle}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {c.painPoints.map((p, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-start gap-3">
                <span className="text-2xl">😔</span>
                <p className="text-slate-700">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-6 py-16 bg-gradient-to-br from-teal-600 to-emerald-600 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">{c.solution.title}</h2>
          <p className="mt-4 text-teal-50">{c.solution.description}</p>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {c.solution.bullets.map((b, i) => (
              <div key={i} className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5">
                <p className="font-semibold">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">{t.benefitsTitle}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.benefits.map((b, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">{t.stepsTitle}</h2>
          <div className="space-y-6">
            {c.howItWorks.map((s) => (
              <div key={s.step} className="flex gap-5 items-start rounded-3xl bg-white border border-slate-200 p-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center text-xl font-bold">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-slate-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">{t.faqTitle}</h2>
          <div className="space-y-3">
            {c.faqs.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-slate-200 p-5">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  <span>{f.q}</span>
                  <span className="text-teal-600 group-open:rotate-180 transition">⌄</span>
                </summary>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold">{c.finalCta.title}</h2>
          <p className="mt-4 text-slate-300">{c.finalCta.subtitle}</p>
          <Link
            href="/ai-consult"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-10 py-4 font-semibold shadow-2xl shadow-teal-500/30 hover:-translate-y-0.5 transition"
          >
            {c.finalCta.buttonText} →
          </Link>
        </div>
      </section>
    </main>
  );
}
