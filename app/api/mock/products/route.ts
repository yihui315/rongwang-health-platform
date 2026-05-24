import { NextResponse } from "next/server";
import { getWorkspaceSessionFromRequest } from "@/src/lib/auth/session";
import {
  listAgentTasks,
  listApprovedStorefrontProducts,
  listComplianceReviews,
  listGeneratedContents,
  listProducts,
} from "@/src/lib/repositories/product-repository";

export async function GET(request: Request) {
  const session = await getWorkspaceSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const [products, contents, complianceReviews, agentTasks, storefrontProducts] = await Promise.all([
    listProducts(),
    listGeneratedContents(),
    listComplianceReviews(),
    listAgentTasks(),
    listApprovedStorefrontProducts(),
  ]);

  return NextResponse.json({
    ok: true,
    products,
    contents,
    complianceReviews,
    agentTasks,
    storefrontProducts,
  });
}
