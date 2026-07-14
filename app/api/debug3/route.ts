import { NextResponse } from 'next/server'
// Import both supabase-js and firebase-admin in the same file
import { createClient } from '@supabase/supabase-js'
import { getAuth } from 'firebase-admin/auth'

export async function GET() {
  try {
    const hasCreateClient = typeof createClient === 'function'
    const hasGetAuth = typeof getAuth === 'function'
    return NextResponse.json({ createClient: hasCreateClient, getAuth: hasGetAuth, message: 'both imports resolved' })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
