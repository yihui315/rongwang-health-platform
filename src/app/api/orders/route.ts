import { NextRequest, NextResponse } from 'next/server';
import { Order, CartItem, OrderForm } from '@/types';
import { getCustomerSessionFromRequest } from '@/lib/auth/customer';
import { selectRowsByCustomerId } from '@/lib/customer-data';
import { getSupabase } from '@/lib/supabase';

function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RW-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSessionFromRequest(request);
    const body = await request.json();

    const items: CartItem[] = body.items;
    const total: number = body.total;
    const customer: OrderForm = body.customer;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!customer || !customer.name || !customer.phone || !customer.email) {
      return NextResponse.json(
        { error: 'Missing customer information' },
        { status: 400 },
      );
    }

    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      items,
      total,
      customer,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Persist via Supabase (stub-safe — no-op when env not configured)
    try {
      await getSupabase().from('orders').insert({
        id: orderId,
        items,
        total,
        customer,
        status: 'pending',
        user_id: session?.user.id ?? null,
      });
    } catch (err) {
      console.error('supabase insert failed', err);
    }

    return NextResponse.json(
      {
        id: orderId,
        status: 'pending',
        message: '订单已成功提交',
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getCustomerSessionFromRequest(request);
  if (!session?.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await selectRowsByCustomerId('orders', session.user.id);
    if (error) {
      throw error;
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
