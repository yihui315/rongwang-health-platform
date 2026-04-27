import { NextResponse } from "next/server";
import { listProducts } from "@/lib/data/products";

/**
 * AI 推荐 API
 * 根据用户健康问卷结果推荐产品
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { concerns = [], age, gender } = body;

    // 根据健康关注点匹配产品
    const planMap: Record<string, string[]> = {
      fatigue: ['liver', 'fatigue'],
      sleep: ['sleep'],
      immune: ['immune'],
      stress: ['stress'],
      beauty: ['beauty'],
      gut: ['gut'],
    };

    const matchedPlans = concerns.flatMap(
      (c: string) => planMap[c] || []
    );

    const products = await listProducts();
    const recommended = products.filter((p) =>
      p.plans.some((plan) => matchedPlans.includes(plan))
    );

    // 按 tier 排序：hero > profit > traffic
    const tierOrder = { hero: 0, profit: 1, traffic: 2 };
    recommended.sort(
      (a, b) => tierOrder[a.tier] - tierOrder[b.tier]
    );

    return NextResponse.json({
      products: recommended.slice(0, 6),
      total: recommended.length,
    });
  } catch (error) {
    console.error("recommendations error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
