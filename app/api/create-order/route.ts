import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
  }

  const razorpay = new Razorpay({ key_id, key_secret });

  const { amount, receipt } = await req.json();

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: receipt || 'receipt_' + Date.now(),
    notes: {},
  });

  return NextResponse.json(order);
}
