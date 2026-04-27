import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, listProducts } from "@/lib/data/products";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");

  if (slug) {
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  let filtered = [...(await listProducts())];

  if (category) {
    filtered = filtered.filter((product) => product.category === category);
  }

  if (brand) {
    filtered = filtered.filter((product) => product.brand === brand);
  }

  return NextResponse.json(filtered);
}
