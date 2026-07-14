import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const sb = await getSupabaseAdmin()
    const { data, error } = await sb.from('bahja_products').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Admin only' }, { status: 401 })
}
