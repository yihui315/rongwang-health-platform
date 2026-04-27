import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductRedirectClient from "@/components/ai/ProductRedirectClient";
import { normalizeSolutionSlug } from "@/lib/health/solutions";
import {
  findRecommendationProduct,
  getRedirectDestination,
} from "@/lib/health/recommendations";

interface ProductMapPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "购买中转页",
  description: "记录商品点击后自动跳转到对应购买入口。",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProductMapPage({
  params,
  searchParams,
}: ProductMapPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const product = findRecommendationProduct(id);

  if (!product) {
    notFound();
  }

  const destination = getRedirectDestination(product);
  const consultationId =
    typeof query.consultation === "string" ? query.consultation : undefined;
  const source = typeof query.source === "string" ? query.source : "product-map";
  const solutionSlug =
    typeof query.solution === "string"
      ? normalizeSolutionSlug(query.solution) ?? undefined
      : undefined;

  return (
    <main className="bg-[var(--bg)]">
      <section className="section-container py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <ProductRedirectClient
            productId={product.slug}
            productName={product.name}
            destinationUrl={destination.url}
            source={source}
            consultationId={consultationId}
            solutionSlug={solutionSlug}
            isExternal={destination.isExternal}
          />
        </div>
      </section>
    </main>
  );
}
