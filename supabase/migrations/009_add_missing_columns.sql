-- 009: agregar columnas que el código usa pero que nunca fueron migradas.
-- Es idempotente (add column if not exists).

-- fecha_consigna en textos: fecha de la consigna cuando se escribe retroactivo
-- (hoja libre de domingo, consigna anterior). No siempre existe, puede ser null.
alter table public.textos
  add column if not exists fecha_consigna date;

-- Si por algún motivo estas no existen en consignas, las aseguramos.
alter table public.consignas
  add column if not exists texto_motivacional text;

alter table public.consignas
  add column if not exists destacada boolean default false;
