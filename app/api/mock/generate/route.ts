import { NextResponse } from "next/server";
import { runGenerateContentAgent } from "@/src/agents/generate-content";
import {
  createContentTask,
  failAgentTask,
  getMockProductById,
  saveContentWithComplianceReview,
} from "@/src/lib/mock-store";

export async function POST(request: Request) {
  let taskId: string | null = null;

  try {
    const body = await request.json();
    const productId = String(body?.productId || "").trim();
    const createdBy = String(body?.createdBy || "local-demo").trim();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = getMockProductById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const task = createContentTask({ productId: product.id, createdBy });
    taskId = task.id;
    const generated = await runGenerateContentAgent({
      productId: product.id,
      title: product.title,
      brand: product.brand,
      originCountry: product.originCountry,
      category: product.category,
      specs: product.specs,
    });

    const { content, review } = saveContentWithComplianceReview(product.id, generated, task.id);

    return NextResponse.json({ ok: true, taskStatus: "completed", taskId: task.id, content, review, product });
  } catch (error) {
    if (taskId) {
      failAgentTask(taskId, error instanceof Error ? error.message : "Generation failed");
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
