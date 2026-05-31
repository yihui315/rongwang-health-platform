import { NextResponse } from "next/server";
import { createGeneratedContent } from "@/src/api/content";
import { requireAdminRequest } from "@/src/lib/auth/admin-guard";

export async function POST(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const productId = String(body?.productId || "").trim();
    const createdBy = String(body?.createdBy || "local-demo").trim();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const result = await createGeneratedContent({ productId, createdBy });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Generation failed",
        task: error instanceof Error && "task" in error ? error.task : undefined,
      },
      { status: error instanceof Error && error.message === "Product not found" ? 404 : 500 }
    );
  }
}
