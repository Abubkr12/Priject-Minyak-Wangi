import { createBrowserClient } from '@supabase/ssr'

let adminClient: ReturnType<typeof createBrowserClient> | null = null
let customerClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient(isAdmin = false) {
  if (isAdmin) {
    if (!adminClient) {
      adminClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          isSingleton: false,
          cookieOptions: { name: 'sb-admin-auth-token' },
          auth: {
            storageKey: 'sb-admin-auth-token',
          }
        }
      )
    }
    return adminClient;
  } else {
    if (!customerClient) {
      customerClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          isSingleton: false,
        }
      )
    }
    return customerClient;
  }
}
