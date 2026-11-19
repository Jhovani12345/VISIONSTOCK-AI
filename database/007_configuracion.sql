-- ============================================================
-- VisionStock AI · Migración 007 · Configuración general (una sola fila)
-- ============================================================
create table if not exists public.configuracion (
  id                          smallint primary key default 1 check (id = 1),
  nombre_almacen              varchar(80)  not null default 'Almacén principal',
  dias_cobertura              int          not null default 15 check (dias_cobertura between 1 and 365),
  ventana_analisis            int          not null default 30 check (ventana_analisis between 7 and 365),
  dias_alerta_reabasto        int          not null default 7  check (dias_alerta_reabasto between 1 and 90),
  stock_minimo_predeterminado numeric(12,2) not null default 0 check (stock_minimo_predeterminado >= 0),
  unidades_medida             text[]       not null default array['PIEZA','CAJA','PAQUETE','KG','LITRO','METRO'],
  fecha_actualizacion         timestamptz  not null default now()
);

insert into public.configuracion (id) values (1) on conflict (id) do nothing;

create or replace function public.tocar_configuracion()
returns trigger language plpgsql as $$
begin
  new.fecha_actualizacion := now();
  new.id := 1;
  return new;
end $$;

drop trigger if exists trg_configuracion_fecha on public.configuracion;
create trigger trg_configuracion_fecha
  before update on public.configuracion
  for each row execute function public.tocar_configuracion();

alter table public.configuracion enable row level security;

drop policy if exists config_select on public.configuracion;
drop policy if exists config_update on public.configuracion;
create policy config_select on public.configuracion for select to authenticated using (true);
create policy config_update on public.configuracion for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
