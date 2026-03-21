alter table public.consignas
  add column if not exists estado text not null default 'borrador'
  check (estado in ('borrador', 'banco', 'programada', 'publicada'));

-- Poblar desde flags actuales
update public.consignas set estado = 'publicada'  where publicado = true;
update public.consignas set estado = 'programada' where publicado = false and borrador = false and fecha is not null;
update public.consignas set estado = 'banco'      where publicado = false and borrador = false and fecha is null;
update public.consignas set estado = 'borrador'   where borrador = true;
