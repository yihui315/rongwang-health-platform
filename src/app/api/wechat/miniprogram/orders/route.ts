import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/products";
import { wechatMiniProgramOrderSchema } from "@/schemas/wechat";

function createOrderNo() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RW-WX-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = wechatMiniProgramOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation_failed" }, { status: 400 });
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of parsed.data.items) {
    const product = await getProductBySlug(item.slug);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "product_not_found", slug: item.slug },
        { status: 400 },
      );
    }

    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;
    orderItems.push({
      slug: product.slug,
      name: product.name,
      quantity: item.quantity,
      unitAmount: product.price,
      subtotal,
    });
  }

  return NextResponse.json({
    success: true,
    mode: "contract",
    order: {
      orderNo: createOrderNo(),
      items: orderItems,
      totalAmount,
      currency: "CNY",
      status: "pending_payment",
      paymentStatus: "unpaid",
      fulfillmentStatus: "unfulfilled",
      customer: parsed.data.customer,
    },
  }, { status: 201 });
}
