-- Ejecutar en Supabase Dashboard → SQL Editor

-- Columnas en profiles para manejo de suscripción a emails
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_suscrito boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_token uuid DEFAULT gen_random_uuid();

-- Columna en consignas para texto motivacional del email diario
ALTER TABLE consignas
  ADD COLUMN IF NOT EXISTS texto_motivacional text;
