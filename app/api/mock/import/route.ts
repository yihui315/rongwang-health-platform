import { NextResponse } from "next/server";
import { createProductImportTask } from "@/src/api/product";
import { getWorkspaceSessionFromRequest } from "@/src/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const sourceUrl = String(body?.sourceUrl || "").trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: "sourceUrl is required" }, { status: 400 });
    }

    const result = await createProductImportTask({ sourceUrl, createdBy: session.email });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
