import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/types';
import { plans } from '@/data/plans';

export function POST(request: NextRequest) {
  try {
    const body = request.json().then(data => {
      const items = data.items as CartItem[];

      // Validate items and calculate totals
      const validatedItems: CartItem[] = [];
      let total = 0;
      let itemCount = 0;

      for (const item of items) {
        const product = plans.find(p => p.slug === item.slug);

        if (!product) {
          continue;
        }

        const quantity = Math.max(1, Math.floor(item.quantity));
        const price = product.price;
        const subtotal = price * quantity;

        validatedItems.push({
          slug: item.slug,
          name: product.name,
          price,
          quantity
        });

        total += subtotal;
        itemCount += quantity;
      }

      return NextResponse.json({
        items: validatedItems,
        total: parseFloat(total.toFixed(2)),
        itemCount,
        shippingFree: total >= 299
      });
    });

    return body;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
