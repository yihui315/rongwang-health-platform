import { NextResponse } from "next/server";
import {
  listAgentTasks,
  listApprovedStorefrontProducts,
  listComplianceReviews,
  listGeneratedContents,
  listMockProducts,
} from "@/src/lib/mock-store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    products: listMockProducts(),
    contents: listGeneratedContents(),
    complianceReviews: listComplianceReviews(),
    agentTasks: listAgentTasks(),
    storefrontProducts: listApprovedStorefrontProducts(),
  });
}
