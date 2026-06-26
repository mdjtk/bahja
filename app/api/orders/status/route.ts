import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const hasAdmin = cookie.split(';').some((c) => c.trim().startsWith('bahja_admin='));
  if (!hasAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { order_id, status } = await req.json();
    if (!order_id || !status) {
      return NextResponse.json({ error: 'order_id and status are required' }, { status: 400 });
    }

    const validStatuses = ['Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bahja_orders')
      .update({ status })
      .eq('order_id', order_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
