/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * 处理支付成功、订阅变更等事件
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing — Stripe needs raw body for signature verification
export const runtime = 'nodejs';

async function getRawBody(req: NextRequest): Promise<Buffer> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error('No body');
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[订单完成]', {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        shippingAddress: (session as unknown as Record<string, unknown>).shipping_details,
      });

      // TODO: Write order to Supabase
      // TODO: Send confirmation email via Resend/Brevo
      // await createOrder(session);
      // await sendConfirmationEmail(session);
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('[新订阅]', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('[订阅更新]', {
        subscriptionId: subscription.id,
        status: subscription.status,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('[订阅取消]', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('[支付失败]', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
      });
      // TODO: Send payment failure email
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
