import { NextResponse } from "next/server";
import { createProductImportTask } from "@/src/api/product";
import { requireAdminRequest } from "@/src/lib/auth/admin-guard";

export async function POST(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const sourceUrl = String(body?.sourceUrl || "").trim();
    const createdBy = String(body?.createdBy || "local-demo").trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: "sourceUrl is required" }, { status: 400 });
    }

    const result = await createProductImportTask({ sourceUrl, createdBy });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Import failed",
        task: error instanceof Error && "task" in error ? error.task : undefined,
      },
      { status: 500 }
    );
  }
}
