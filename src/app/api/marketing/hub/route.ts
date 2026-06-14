import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getWechatReadinessStatus } from "@/lib/wechat/config";
import { getGeoFlowAutomationStatus } from "@/lib/marketing/geoflow";

export async function GET(request: NextRequest) {
  const prisma = getPrisma();

  // Posts stats
  let posts_total = 0;
  let posts_by_platform: Record<string, number> = {};
  let recent_posts: Array<{
    id: string;
    title: string;
    platform: string;
    status: string;
    createdAt: string;
  }> = [];

  if (prisma) {
    const posts = await prisma.marketingPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    posts_total = posts.length;
    posts.forEach((p) => {
      posts_by_platform[p.platform] = (posts_by_platform[p.platform] ?? 0) + 1;
    });
    recent_posts = posts.map((p) => ({
      id: p.id,
      title: p.title,
      platform: p.platform,
      status: p.status ?? "draft",
      createdAt: p.createdAt.toISOString(),
    }));
  }

  // Accounts stats
  let accounts_total = 0;
  let accounts_by_platform: Record<string, number> = {};
  if (prisma) {
    const accounts = await prisma.platformAccount.findMany({});
    accounts_total = accounts.length;
    accounts.forEach((a) => {
      accounts_by_platform[a.platform] = (accounts_by_platform[a.platform] ?? 0) + 1;
    });
  }

  const wechat = getWechatReadinessStatus();
  const geoFlow = getGeoFlowAutomationStatus();

  return NextResponse.json({
    posts_total,
    posts_by_platform,
    accounts_total,
    accounts_by_platform,
    wechat_configured: wechat.officialAccount.configured,
    geoflow_configured: geoFlow.configured,
    recent_posts,
  });
}