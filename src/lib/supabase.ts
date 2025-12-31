import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Disable auto refresh to prevent tab switch corruption
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )
}


