import Link from "next/link";
import { countProducts } from "@/lib/data/products";

const cards = [
  {
    title: "Product Library",
    description: "Review the active product catalog, brands, tags, and destination mapping.",
    href: "/admin/products",
  },
  {
    title: "Consultations",
    description: "Review stored AI consultation records and confirm persistence is working.",
    href: "/admin/consultations",
  },
  {
    title: "AI Logs",
    description: "Review provider, model, prompt version, and fallback metadata from the new consultation pipeline.",
    href: "/admin/ai-logs",
  },
  {
    title: "Recommendation Rules",
    description: "Review the current AI direction to product-plan mapping before the editable rule engine ships.",
    href: "/admin/rules",
  },
  {
    title: "Click Analytics",
    description: "Review PDD redirect attribution by source page, solution type, session, and consultation.",
    href: "/admin/analytics",
  },
  {
    title: "Marketing Automation",
    description: "Plan AI-first campaigns, GEOFlow task drafts, UTM tracking, and compliance checks.",
    href: "/admin/marketing",
  },
  {
    title: "WeChat Operations",
    description: "Review Official Account drafts, Mini Program readiness, and WeChat Pay launch checks.",
    href: "/admin/marketing#wechat-operations",
  },
];

export default async function AdminPage() {
  const productCount = await countProducts();

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16 md:py-20">
        <span className="badge-teal">Admin</span>
        <h1 className="mt-4 text-slate-900">Operations Dashboard</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-500">
          This phase keeps the admin area read-first while the new Prisma-backed data foundation is introduced.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="card-hover">
              <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-6">
          <p className="text-sm font-medium text-slate-900">Current product count</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{productCount}</p>
          <p className="mt-2 text-sm text-slate-500">
            This card prefers Prisma-backed product storage and safely falls back to the static catalog during migration.
          </p>
        </div>
      </section>
    </main>
  );
}
