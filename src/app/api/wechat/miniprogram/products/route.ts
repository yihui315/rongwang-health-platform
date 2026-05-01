import { NextResponse } from "next/server";
import { getAiConsultHrefForValue } from "@/lib/health/consult-entry";
import { listProducts } from "@/lib/data/products";
import { buildMiniProgramPddAction } from "@/lib/wechat/pdd-link";

export async function GET() {
  const products = (await listProducts())
    .map((product) => ({
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      plans: product.plans,
      price: product.price,
      memberPrice: product.memberPrice,
      unit: product.unit,
      tagline: product.tagline,
      images: product.images,
      stock: product.stock,
      pddManaged: Boolean(product.pddUrl),
      purchaseMode: "pdd_guided_redirect",
      pddAction: buildMiniProgramPddAction(product, {
        source: "miniprogram_catalog",
      }),
    }));

  return NextResponse.json({
    success: true,
    primaryCta: {
      label: "Start AI assessment",
      href: getAiConsultHrefForValue(null),
    },
    products,
    disclaimer: "Health education only. Mini Program checkout is disabled until WeChat Pay readiness is complete.",
  });
}
