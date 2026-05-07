import { NextResponse } from "next/server";
import { runFetchProductAgent } from "@/src/agents/fetch-product";
import { createImportTask, failAgentTask, saveImportedProduct } from "@/src/lib/mock-store";

export async function POST(request: Request) {
  let taskId: string | null = null;

  try {
    const body = await request.json();
    const sourceUrl = String(body?.sourceUrl || "").trim();
    const createdBy = String(body?.createdBy || "local-demo").trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: "sourceUrl is required" }, { status: 400 });
    }

    const task = createImportTask({ sourceUrl, createdBy });
    taskId = task.id;
    const normalized = await runFetchProductAgent({ sourceUrl, createdBy });
    const product = saveImportedProduct(normalized, task.id);

    return NextResponse.json({ ok: true, taskStatus: "completed", taskId: task.id, product });
  } catch (error) {
    if (taskId) {
      failAgentTask(taskId, error instanceof Error ? error.message : "Import failed");
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
