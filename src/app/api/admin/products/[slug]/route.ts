import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { updateProductForAdmin } from "@/lib/data/products";
import { productStockValues } from "@/schemas/product";

const adminProductUpdateSchema = z
  .object({
    active: z.boolean().optional(),
    stock: z.enum(productStockValues).optional(),
    officialUrl: z.string().url().nullable().optional(),
    pddUrl: z.string().url().nullable().optional(),
  })
  .strict();

interface AdminProductRouteContext {
  params: Promise<{ slug: string }>;
}

export async function PATCH(request: Request, context: AdminProductRouteContext) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = adminProductUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid product update", details: parsed.error.flatten() }, { status: 400 });
  }

  const { slug } = await context.params;
  const product = await updateProductForAdmin(slug, parsed.data);
  if (!product) {
    return NextResponse.json({ error: "product storage unavailable" }, { status: 503 });
  }

  return NextResponse.json({ product });
}
