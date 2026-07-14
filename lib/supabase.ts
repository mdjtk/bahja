let supabaseAdminPromise: any = null

export async function getSupabaseAdmin() {
  if (!supabaseAdminPromise) {
    supabaseAdminPromise = (async () => {
      const { createClient } = await import('@supabase/supabase-js')
      return createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
    })()
  }
  return supabaseAdminPromise
}
