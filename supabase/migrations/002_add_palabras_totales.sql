alter table profiles
  add column if not exists palabras_totales integer not null default 0;

create or replace function incrementar_palabras_totales(uid uuid, incremento integer)
returns void
language sql
security definer
as $$
  update profiles
  set palabras_totales = palabras_totales + incremento
  where id = uid;
$$;
