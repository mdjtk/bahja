import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth-helpers'

const DEFAULT_SETTINGS: Record<string, string> = {
  store_name: 'Bahja',
  store_phone: '+91 80868 72603',
  store_email: 'hello@bahja.in',
  store_address: '',
  shipping_charge: '0',
  free_shipping_threshold: '499',
  tax_rate: '0',
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from('bahja_settings')
    .select('*')
  if (error) { console.error('Error fetching settings:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }

  const settings: Record<string, string> = { ...DEFAULT_SETTINGS }
  for (const row of data || []) {
    settings[row.key] = row.value
  }
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const entries = Object.entries(body).filter(([k]) => k in DEFAULT_SETTINGS)

    for (const [key, value] of entries) {
      await getSupabaseAdmin()
        .from('bahja_settings')
        .upsert({ key, value: String(value) }, { onConflict: 'key' })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error in POST /api/admin/settings:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
