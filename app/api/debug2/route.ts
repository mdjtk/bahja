import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    const sb = await getSupabaseAdmin()
    const { data } = await sb.from('bahja_products').select('slug').limit(5)
    return NextResponse.json({
      supabaseOk: true,
      slugs: (data || []).map((r: any) => r.slug),
      isAdminAvailable: typeof isAdmin === 'function',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
