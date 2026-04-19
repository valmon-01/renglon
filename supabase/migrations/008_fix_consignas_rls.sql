-- ============================================================
-- Fix RLS de consignas:
--   1) Las políticas viejas usaban la columna "aprobada" que fue
--      dropeada en 007 → SELECT quedó siempre false para anon.
--   2) Las de admin tenían un email hardcodeado que ya no es la
--      única fuente de verdad (ahora usamos ADMIN_EMAIL).
-- Estrategia:
--   - SELECT público sólo para consignas 'publicada' (lo que ven
--     editor, home, feed).
--   - INSERT/UPDATE/DELETE: sin policy explícita para authenticated.
--     Todas las mutaciones pasan por /api/* con supabaseAdmin
--     (service role), que bypassa RLS. El backend ya valida admin.
-- ============================================================

-- Drop policies viejas (si existen)
drop policy if exists "Consignas aprobadas son visibles para todos" on public.consignas;
drop policy if exists "Admin puede ver todas las consignas"          on public.consignas;
drop policy if exists "Solo admin puede insertar consignas"          on public.consignas;
drop policy if exists "Solo admin puede actualizar consignas"        on public.consignas;
drop policy if exists "Solo admin puede eliminar consignas"          on public.consignas;

-- SELECT público para consignas publicadas (feed, home, editor las consultan con anon)
create policy "Consignas publicadas son visibles para todos"
  on public.consignas for select
  using (estado = 'publicada');

-- Sin policies de INSERT/UPDATE/DELETE: todas las mutaciones pasan por
-- el backend con service role, que bypassa RLS. Esto mata cualquier
-- intento de insert/update desde cliente con anon key.
