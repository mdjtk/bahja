import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let userId: string | null = null;
    try {
      const sb = await createClient();
      const { data: { user } } = await sb.auth.getUser();
      userId = user?.id ?? null;
    } catch {}

    const { data, error } = await supabase
      .from('bahja_orders')
      .insert({
        order_id: body.order_id,
        items: body.items,
        customer_name: body.customer_name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        payment_method: body.payment_method,
        total: body.total,
        razorpay_payment_id: body.razorpay_payment_id || null,
        status: 'Confirmed',
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const hasAdmin = cookie.split(';').some((c) => c.trim().startsWith('bahja_admin='));
  if (!hasAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabase
      .from('bahja_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
