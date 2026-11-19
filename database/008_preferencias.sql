-- ============================================================
-- VisionStock AI · Migración 008 · Preferencias de interfaz por usuario
-- Tema, idioma, tipografía, tamaño de letra y color de acento.
-- Cada usuario solo puede leer y modificar sus propias preferencias.
-- ============================================================
create table if not exists public.preferencia_usuario (
  id_usuario          uuid primary key references public.perfil(id) on delete cascade,
  tema                varchar(10) not null default 'claro'  check (tema in ('claro', 'oscuro', 'sistema')),
  idioma              varchar(5)  not null default 'es'     check (idioma in ('es', 'en')),
  tipografia          varchar(30) not null default 'inter'  check (tipografia in ('inter', 'roboto', 'poppins', 'nunito', 'source', 'sistema')),
  tamano              varchar(10) not null default 'normal' check (tamano in ('pequeno', 'normal', 'grande')),
  color               varchar(20) not null default 'cian'   check (color in ('cian', 'azul', 'indigo', 'violeta', 'verde', 'rosa', 'naranja', 'grafito')),
  fecha_actualizacion timestamptz not null default now()
);

create or replace function public.tocar_preferencia()
returns trigger language plpgsql as $$
begin
  new.fecha_actualizacion := now();
  return new;
end $$;

drop trigger if exists trg_preferencia_fecha on public.preferencia_usuario;
create trigger trg_preferencia_fecha
  before update on public.preferencia_usuario
  for each row execute function public.tocar_preferencia();

alter table public.preferencia_usuario enable row level security;

drop policy if exists pref_select on public.preferencia_usuario;
drop policy if exists pref_insert on public.preferencia_usuario;
drop policy if exists pref_update on public.preferencia_usuario;
create policy pref_select on public.preferencia_usuario for select to authenticated
  using (id_usuario = auth.uid());
create policy pref_insert on public.preferencia_usuario for insert to authenticated
  with check (id_usuario = auth.uid());
create policy pref_update on public.preferencia_usuario for update to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());
