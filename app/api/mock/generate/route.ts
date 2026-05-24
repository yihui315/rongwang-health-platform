import { NextResponse } from "next/server";
import { createGeneratedContentForProduct } from "@/src/api/content";
import { getWorkspaceSessionFromRequest } from "@/src/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const productId = String(body?.productId || "").trim();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const result = await createGeneratedContentForProduct({ productId, createdBy: session.email });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
