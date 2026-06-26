import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
  }

  const razorpay = new Razorpay({ key_id, key_secret });

  try {
    const body = await req.json();
    const { razorpay_payment_id } = body;

    if (!razorpay_payment_id) {
      return NextResponse.json({ error: 'razorpay_payment_id required' }, { status: 400 });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status === 'captured') {
      return NextResponse.json({ verified: true, payment });
    }

    return NextResponse.json({ verified: false, status: payment.status }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
