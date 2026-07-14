import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const rl = checkRateLimit(`subscriber:${ip}`, { maxTokens: 10 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: existing } = await (await getSupabaseAdmin())
      .from('bahja_subscribers')
      .select('email')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 })
    }

    const { error } = await (await getSupabaseAdmin())
      .from('bahja_subscribers')
      .insert({ email, created_at: new Date().toISOString() })

    if (error) throw error
    return NextResponse.json({ email }, { status: 201 })
  } catch (err: any) {
    console.error('Subscriber error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await (await getSupabaseAdmin())
      .from('bahja_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error fetching subscribers:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
