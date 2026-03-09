import { createClient } from '@supabase/supabase-js'

// Cliente con service role para operaciones admin (bypassa RLS)
// Requiere SUPABASE_SERVICE_ROLE_KEY en las variables de entorno
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
