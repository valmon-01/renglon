import "server-only"
import { createClient } from "@supabase/supabase-js"

// Cliente con service role para operaciones admin (bypassa RLS).
// `import "server-only"` hace que el build falle si esto se importa desde un
// Client Component, evitando filtrar SUPABASE_SERVICE_ROLE_KEY al bundle.
// Requiere SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
