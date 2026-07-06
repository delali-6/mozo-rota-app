import { createClient } from '@supabase/supabase-js'

// Shared browser-side Supabase client used by pages and components for auth and database calls.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
