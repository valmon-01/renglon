-- ============================================================
-- renglón — Schema de base de datos
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================


-- ============================================================
-- TABLAS
-- ============================================================

-- Perfiles de usuario (extiende auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text,
  bio         text,
  racha_actual    int4 not null default 0,
  ultima_escritura date,
  created_at  timestamptz not null default now()
);

-- Consignas diarias (generadas con IA, aprobadas por admin)
create table if not exists public.consignas (
  id          uuid primary key default gen_random_uuid(),
  texto       text not null,
  categoria   text not null,
  fecha       date not null unique,
  aprobada    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Textos escritos por los usuarios
create table if not exists public.textos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  contenido   text not null,
  titulo      text,
  consigna    text,
  publicado   boolean not null default false,
  tags        text[],
  created_at  timestamptz not null default now()
);

-- Likes de textos
create table if not exists public.likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  texto_id    uuid not null references public.textos(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, texto_id)
);

-- Follows entre usuarios
create table if not exists public.follows (
  id            uuid primary key default gen_random_uuid(),
  follower_id   uuid not null references auth.users(id) on delete cascade,
  following_id  uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);


-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.consignas enable row level security;
alter table public.textos    enable row level security;
alter table public.likes     enable row level security;
alter table public.follows   enable row level security;


-- profiles
create policy "Perfiles públicos son visibles para todos"
  on public.profiles for select
  using (true);

create policy "Usuario puede actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);


-- consignas
create policy "Consignas aprobadas son visibles para todos"
  on public.consignas for select
  using (aprobada = true);

create policy "Solo autenticados pueden insertar consignas"
  on public.consignas for insert
  with check (auth.role() = 'authenticated');


-- textos
create policy "Textos publicados son visibles para todos"
  on public.textos for select
  using (publicado = true or auth.uid() = user_id);

create policy "Usuario puede insertar sus propios textos"
  on public.textos for insert
  with check (auth.uid() = user_id);

create policy "Usuario puede actualizar sus propios textos"
  on public.textos for update
  using (auth.uid() = user_id);

create policy "Usuario puede eliminar sus propios textos"
  on public.textos for delete
  using (auth.uid() = user_id);


-- likes
create policy "Likes son visibles para todos"
  on public.likes for select
  using (true);

create policy "Usuario puede dar like"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Usuario puede quitar su like"
  on public.likes for delete
  using (auth.uid() = user_id);


-- follows
create policy "Follows son visibles para todos"
  on public.follows for select
  using (true);

create policy "Usuario puede seguir a otros"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Usuario puede dejar de seguir"
  on public.follows for delete
  using (auth.uid() = follower_id);


-- ============================================================
-- ÍNDICES
-- ============================================================

create index if not exists textos_user_id_idx    on public.textos(user_id);
create index if not exists textos_publicado_idx  on public.textos(publicado);
create index if not exists textos_created_at_idx on public.textos(created_at desc);
create index if not exists consignas_fecha_idx   on public.consignas(fecha);
create index if not exists likes_texto_id_idx    on public.likes(texto_id);
create index if not exists follows_following_idx on public.follows(following_id);
