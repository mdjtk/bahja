import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await getSupabaseAdmin()
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) throw error

    const mapped = (users || []).map((u: any) => ({
      uid: u.id,
      email: u.email,
      displayName: u.user_metadata?.full_name || u.user_metadata?.name || '',
      phoneNumber: u.phone || '',
      photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
      provider: u.app_metadata?.providers || [],
      disabled: u.banned_at ? true : false,
    }))

    return NextResponse.json(mapped)
  } catch (err: any) {
    console.error('Error in GET /api/admin/users:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
