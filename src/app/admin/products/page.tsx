import Link from "next/link";
import { ProductStatusEditor } from "@/components/admin/ProductStatusEditor";
import { listProductsForAdmin } from "@/lib/data/products";

export default async function AdminProductsPage() {
  const products = await listProductsForAdmin();

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-teal">Products</span>
            <h1 className="mt-4 text-slate-900">Product Library</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              The page now reads through the migration-safe product data layer, with Prisma first and the static catalog as fallback.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          {products.map((product) => (
            <div key={product.slug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-sm font-medium text-teal-700">{product.brand}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{product.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{product.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.plans.map((plan) => (
                      <span key={plan} className="badge-slate">{plan}</span>
                    ))}
                  </div>
                </div>
                <div className="min-w-[180px] text-right">
                  <span className={product.active ? "badge-slate" : "rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"}>
                    {product.active ? "active" : "paused"}
                  </span>
                  <p className="text-sm text-slate-500">Member price</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">HK${product.memberPrice}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Official: {product.officialUrl ? "configured" : "not configured"} · PDD: {product.pddUrl ? "configured" : "not configured"}
                  </p>
                </div>
              </div>
              <ProductStatusEditor product={product} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
