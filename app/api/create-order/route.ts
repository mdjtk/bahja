import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { verifyAuth } from '@/lib/auth-helpers';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const decoded = await verifyAuth(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const rl = checkRateLimit(`create-order:${decoded.uid}`, { maxTokens: 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const { items, receipt } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Server-side amount reconstruction
    let computedTotal = 0;
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('bahja_products')
        .select('variants')
        .eq('id', item.id)
        .single();

      if (!product) {
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }

      const variant = product.variants?.[item.variant];
      if (!variant || typeof variant.price !== 'number') {
        return NextResponse.json({ error: `Variant ${item.variant} not found` }, { status: 400 });
      }

      computedTotal += variant.price * (item.qty || 1);
    }

    if (computedTotal <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(computedTotal * 100),
      currency: 'INR',
      receipt: receipt || 'receipt_' + Date.now(),
      notes: {},
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}