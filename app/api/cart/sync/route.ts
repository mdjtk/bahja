import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { items } = await req.json()
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  const rows = items.map((item: any) => ({
    user_id: user.id,
    product_id: item.id,
    variant: item.variant,
    qty: item.qty,
  }))

  const { error } = await supabase
    .from('bahja_cart')
    .upsert(rows, { onConflict: 'user_id,product_id,variant' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ synced: rows.length })
}
