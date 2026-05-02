import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/products";
import { buildMiniProgramPddAction } from "@/lib/wechat/pdd-link";
import { buildMiniProgramSiteMallAction } from "@/lib/wechat/site-mall";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({
      success: false,
      error: "wechat_miniprogram_product_not_found",
    }, { status: 404 });
  }

  const url = new URL(request.url);
  const attribution = {
    source: url.searchParams.get("source") ?? "miniprogram_detail",
    campaign: url.searchParams.get("campaign") ?? undefined,
    solutionSlug: url.searchParams.get("solutionSlug") ?? undefined,
    sessionId: url.searchParams.get("sessionId") ?? undefined,
  };

  return NextResponse.json({
    success: true,
    product: {
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
      hero: product.hero,
      keyIngredients: product.keyIngredients,
      howToUse: product.howToUse,
      warnings: product.warnings,
      images: product.images,
      stock: product.stock,
      siteMallAction: buildMiniProgramSiteMallAction(product, attribution),
      pddManaged: Boolean(product.pddUrl),
      purchaseMode: "pdd_guided_redirect",
      pddAction: buildMiniProgramPddAction(product, attribution),
    },
    disclaimer: "Health education only. Complete an AI assessment before deciding whether this product direction is suitable.",
  });
}
