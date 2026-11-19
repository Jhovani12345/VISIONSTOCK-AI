-- ============================================================
-- VisionStock AI · Migración 004 · Protección del último administrador
-- Evita quedarse sin ningún SUPER_ADMIN activo (por cambio de rol o desactivación).
-- ============================================================
create or replace function public.proteger_ultimo_admin()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_admin smallint;
  v_otros int;
begin
  select id_rol into v_admin from public.rol where nombre_rol = 'SUPER_ADMIN';

  if old.id_rol = v_admin and old.activo
     and (new.id_rol <> v_admin or not new.activo) then
    select count(*) into v_otros
    from public.perfil
    where id_rol = v_admin and activo and id <> old.id;

    if v_otros = 0 then
      raise exception 'Debe existir al menos un Super administrador activo.';
    end if;
  end if;
  return new;
end $$;

create trigger trg_proteger_ultimo_admin
  before update of id_rol, activo on public.perfil
  for each row execute function public.proteger_ultimo_admin();
