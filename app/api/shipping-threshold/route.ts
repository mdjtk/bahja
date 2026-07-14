import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const DEFAULT_THRESHOLD = 400

export async function GET() {
  try {
    const { data } = await (await getSupabaseAdmin())
      .from('bahja_settings')
      .select('value')
      .eq('key', 'shipping_threshold')
      .single()

    const threshold = data?.value ? Number(data.value) : DEFAULT_THRESHOLD
    return NextResponse.json({ threshold })
  } catch {
    return NextResponse.json({ threshold: DEFAULT_THRESHOLD })
  }
}

export async function POST(req: Request) {
  const { isAdmin } = await import('@/lib/auth-helpers')
  const nreq = req as unknown as NextRequest
  if (!isAdmin(nreq)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { threshold } = await req.json()
    if (!threshold || threshold < 0) {
      return NextResponse.json({ error: 'Invalid threshold' }, { status: 400 })
    }
    const { error } = await (await getSupabaseAdmin())
      .from('bahja_settings')
      .upsert({ key: 'shipping_threshold', value: String(threshold), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
    return NextResponse.json({ success: true, threshold })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
