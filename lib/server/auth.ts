import "server-only"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

/**
 * Cliente SSR de Supabase para Route Handlers / Server Components.
 * Lee cookies del request; no persiste cambios (los handlers no setean sesión).
 */
export async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // No seteamos cookies desde handlers/server components de lectura.
        },
      },
    },
  )
}

/**
 * Devuelve el usuario autenticado o null. Usa getUser() que valida contra
 * el servidor de Auth (no confiar solo en la cookie).
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ?? null
}

/**
 * Verifica que el request venga de un admin autenticado.
 * Retorna el user o null. El email admin se configura via env ADMIN_EMAIL.
 */
export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail) return null
  if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) return null
  return user
}

/**
 * Verifica que el request provenga del cron de Vercel.
 * Vercel Cron envía automáticamente `Authorization: Bearer $CRON_SECRET`.
 */
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}
