import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");

  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  let filtered = [...products];

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (brand) {
    filtered = filtered.filter((p) => p.brand === brand);
  }

  return NextResponse.json(filtered);
}
