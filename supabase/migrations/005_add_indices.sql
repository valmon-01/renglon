create index if not exists idx_textos_user_borrador on public.textos(user_id, borrador);
create index if not exists idx_textos_consigna on public.textos(consigna);
create index if not exists idx_textos_fecha_consigna on public.textos(fecha_consigna);
create index if not exists idx_follows_follower on public.follows(follower_id);
