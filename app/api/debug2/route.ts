import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
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
