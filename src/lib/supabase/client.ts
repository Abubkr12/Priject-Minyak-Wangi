import { createBrowserClient } from '@supabase/ssr'

export function createClient(isAdmin = false) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: isAdmin ? { name: 'sb-admin-auth-token' } : undefined,
    }
  )
}
