-- ============================================================
-- VisionStock AI · Migración 001 (PostgreSQL / Supabase)
-- Pegar completo en: Supabase > SQL Editor > Run
-- ============================================================

-- 1. ROL -----------------------------------------------------
create table public.rol (
  id_rol      smallint generated always as identity primary key,
  nombre_rol  varchar(30) not null unique,
  descripcion varchar(150)
);

insert into public.rol (nombre_rol, descripcion) values
  ('SUPER_ADMIN',        'Administra y supervisa todo el sistema'),
  ('TRABAJADOR_ALMACEN', 'Realiza las operaciones del almacén')
on conflict (nombre_rol) do nothing;

-- 2. PERFIL (extiende auth.users) ----------------------------
create table public.perfil (
  id             uuid primary key references auth.users(id) on delete cascade,
  id_rol         smallint not null references public.rol(id_rol),
  nombre         varchar(50) not null,
  apellido       varchar(80) not null default '',
  correo         varchar(120) not null unique,
  activo         boolean not null default true,
  fecha_registro timestamptz not null default now()
);
create index idx_perfil_rol on public.perfil(id_rol);

-- 3. PRODUCTO ------------------------------------------------
create table public.producto (
  id_producto   bigint generated always as identity primary key,
  codigo_barras varchar(50)  not null unique,
  nombre        varchar(100) not null,
  descripcion   varchar(250),
  unidad_medida varchar(30)  not null default 'PIEZA',
  ubicacion     varchar(80),
  stock_minimo  numeric(12,2) not null default 0 check (stock_minimo >= 0),
  activo        boolean not null default true
);
create index idx_producto_nombre on public.producto (lower(nombre));

-- 4. INVENTARIO ----------------------------------------------
create table public.inventario (
  id_inventario       bigint generated always as identity primary key,
  id_producto         bigint not null unique references public.producto(id_producto) on delete cascade,
  cantidad_actual     numeric(12,2) not null default 0 check (cantidad_actual >= 0),
  fecha_actualizacion timestamptz not null default now()
);

-- 5. MOVIMIENTO_INVENTARIO -----------------------------------
create table public.movimiento_inventario (
  id_movimiento    bigint generated always as identity primary key,
  id_producto      bigint not null references public.producto(id_producto),
  id_usuario       uuid   not null references public.perfil(id),
  tipo_movimiento  varchar(10) not null check (tipo_movimiento in ('ENTRADA','SALIDA')),
  cantidad         numeric(12,2) not null check (cantidad > 0),
  fecha_movimiento timestamptz not null default now(),
  observaciones    varchar(250)
);
create index idx_mov_producto_fecha on public.movimiento_inventario (id_producto, fecha_movimiento desc);
create index idx_mov_usuario        on public.movimiento_inventario (id_usuario);
create index idx_mov_fecha          on public.movimiento_inventario (fecha_movimiento desc);

-- 6. AUDITORIA / DETALLE -------------------------------------
create table public.auditoria (
  id_auditoria    bigint generated always as identity primary key,
  id_usuario      uuid not null references public.perfil(id),
  fecha_auditoria timestamptz not null default now(),
  estado          varchar(20) not null default 'EN_PROCESO'
                  check (estado in ('EN_PROCESO','FINALIZADA','CANCELADA')),
  observaciones   varchar(250)
);

create table public.detalle_auditoria (
  id_detalle       bigint generated always as identity primary key,
  id_auditoria     bigint not null references public.auditoria(id_auditoria) on delete cascade,
  id_producto      bigint not null references public.producto(id_producto),
  cantidad_sistema numeric(12,2) not null check (cantidad_sistema >= 0),
  cantidad_fisica  numeric(12,2) not null check (cantidad_fisica  >= 0),
  diferencia       numeric(12,2) generated always as (cantidad_fisica - cantidad_sistema) stored,
  metodo_conteo    varchar(20) not null check (metodo_conteo in ('MANUAL','IA')),
  confirmado       boolean not null default false,
  unique (id_auditoria, id_producto)
);
create index idx_detalle_auditoria on public.detalle_auditoria(id_auditoria);

-- 7. RECONOCIMIENTO_IA ---------------------------------------
create table public.reconocimiento_ia (
  id_reconocimiento    bigint generated always as identity primary key,
  id_usuario           uuid   not null references public.perfil(id),
  id_producto          bigint not null references public.producto(id_producto),
  cantidad_detectada   numeric(12,2) not null check (cantidad_detectada >= 0),
  confianza            numeric(5,2) check (confianza is null or (confianza between 0 and 100)),
  fecha_reconocimiento timestamptz not null default now(),
  confirmado           boolean not null default false,
  observaciones        varchar(250)
);
create index idx_reco_usuario on public.reconocimiento_ia(id_usuario, fecha_reconocimiento desc);

-- 8. ALERTA --------------------------------------------------
create table public.alerta (
  id_alerta    bigint generated always as identity primary key,
  id_producto  bigint not null references public.producto(id_producto) on delete cascade,
  tipo_alerta  varchar(30) not null check (tipo_alerta in ('STOCK_BAJO','AGOTADO')),
  mensaje      varchar(250) not null,
  estado       varchar(20) not null default 'ACTIVA'
               check (estado in ('ACTIVA','ATENDIDA','CANCELADA')),
  fecha_alerta timestamptz not null default now()
);
create index idx_alerta_estado on public.alerta(estado, fecha_alerta desc);

-- 9. PREDICCION ----------------------------------------------
create table public.prediccion (
  id_prediccion    bigint generated always as identity primary key,
  id_producto      bigint not null references public.producto(id_producto) on delete cascade,
  consumo_estimado numeric(10,2) not null check (consumo_estimado >= 0),
  dias_existencia  numeric(10,2) not null check (dias_existencia  >= 0),
  fecha_prediccion timestamptz not null default now()
);
create index idx_pred_producto on public.prediccion(id_producto, fecha_prediccion desc);

-- ============================================================
-- FUNCIONES AUXILIARES DE ROL (security definer: evitan recursión en RLS)
-- ============================================================
create or replace function public.rol_actual()
returns text language sql stable security definer set search_path = public as $$
  select r.nombre_rol
  from public.perfil p join public.rol r on r.id_rol = p.id_rol
  where p.id = auth.uid() and p.activo
$$;

create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.rol_actual() = 'SUPER_ADMIN', false)
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Alta de usuario en Auth -> crea perfil.
-- El primer usuario registrado es SUPER_ADMIN; los demás TRABAJADOR_ALMACEN.
-- El rol NUNCA se toma de los metadatos enviados por el cliente.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_rol smallint;
begin
  if not exists (select 1 from public.perfil) then
    select id_rol into v_rol from public.rol where nombre_rol = 'SUPER_ADMIN';
  else
    select id_rol into v_rol from public.rol where nombre_rol = 'TRABAJADOR_ALMACEN';
  end if;

  insert into public.perfil (id, id_rol, nombre, apellido, correo)
  values (
    new.id, v_rol,
    coalesce(nullif(new.raw_user_meta_data->>'nombre',''), split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'apellido',''),
    new.email
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Producto nuevo -> fila de inventario en 0
create or replace function public.crear_inventario_producto()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.inventario (id_producto) values (new.id_producto);
  return new;
end $$;

create trigger trg_producto_inventario
  after insert on public.producto
  for each row execute function public.crear_inventario_producto();

-- Cambio de stock -> genera / cierra alertas (sin duplicar)
create or replace function public.evaluar_alerta_stock()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_min numeric; v_nombre text; v_tipo text;
begin
  select stock_minimo, nombre into v_min, v_nombre
  from public.producto where id_producto = new.id_producto;

  if new.cantidad_actual <= 0 then v_tipo := 'AGOTADO';
  elsif new.cantidad_actual <= v_min then v_tipo := 'STOCK_BAJO';
  else v_tipo := null;
  end if;

  update public.alerta set estado = 'ATENDIDA'
  where id_producto = new.id_producto and estado = 'ACTIVA'
    and (v_tipo is null or tipo_alerta <> v_tipo);

  if v_tipo is not null and not exists (
    select 1 from public.alerta
    where id_producto = new.id_producto and estado = 'ACTIVA' and tipo_alerta = v_tipo
  ) then
    insert into public.alerta (id_producto, tipo_alerta, mensaje)
    values (new.id_producto, v_tipo,
      format('%s: %s (existencia %s, mínimo %s)',
             case v_tipo when 'AGOTADO' then 'Producto agotado' else 'Stock bajo' end,
             v_nombre, new.cantidad_actual, v_min));
  end if;
  return new;
end $$;

create trigger trg_inventario_alerta
  after update of cantidad_actual on public.inventario
  for each row execute function public.evaluar_alerta_stock();

-- ============================================================
-- RPC TRANSACCIONAL: entradas y salidas (atómico, con bloqueo de fila)
-- ============================================================
create or replace function public.registrar_movimiento(
  p_id_producto   bigint,
  p_tipo          text,
  p_cantidad      numeric,
  p_observaciones text default null
) returns public.movimiento_inventario
language plpgsql security definer set search_path = public as $$
declare
  v_stock numeric;
  v_mov   public.movimiento_inventario;
begin
  if public.rol_actual() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_tipo not in ('ENTRADA','SALIDA') then
    raise exception 'Tipo de movimiento inválido';
  end if;
  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'La cantidad debe ser mayor a cero';
  end if;
  if not exists (select 1 from public.producto where id_producto = p_id_producto and activo) then
    raise exception 'Producto no encontrado o inactivo';
  end if;

  select cantidad_actual into v_stock
  from public.inventario where id_producto = p_id_producto for update;
  if not found then
    raise exception 'El producto no tiene registro de inventario';
  end if;

  if p_tipo = 'SALIDA' and v_stock < p_cantidad then
    raise exception 'Stock insuficiente (disponible: %)', v_stock;
  end if;

  update public.inventario
  set cantidad_actual = cantidad_actual + case when p_tipo = 'ENTRADA' then p_cantidad else -p_cantidad end,
      fecha_actualizacion = now()
  where id_producto = p_id_producto;

  insert into public.movimiento_inventario (id_producto, id_usuario, tipo_movimiento, cantidad, observaciones)
  values (p_id_producto, auth.uid(), p_tipo, p_cantidad, p_observaciones)
  returning * into v_mov;

  return v_mov;
end $$;

revoke all on function public.registrar_movimiento(bigint, text, numeric, text) from public, anon;
grant execute on function public.registrar_movimiento(bigint, text, numeric, text) to authenticated;
grant execute on function public.rol_actual(), public.es_admin() to authenticated;

-- ============================================================
-- VISTA DE INVENTARIO (hereda RLS del usuario que consulta)
-- ============================================================
create or replace view public.vista_inventario with (security_invoker = true) as
select p.id_producto, p.codigo_barras, p.nombre, p.descripcion, p.unidad_medida,
       p.ubicacion, p.stock_minimo, p.activo,
       i.cantidad_actual, i.fecha_actualizacion,
       case when i.cantidad_actual <= 0            then 'AGOTADO'
            when i.cantidad_actual <= p.stock_minimo then 'STOCK_BAJO'
            else 'DISPONIBLE' end as estado
from public.producto p
join public.inventario i on i.id_producto = p.id_producto;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.rol                   enable row level security;
alter table public.perfil                enable row level security;
alter table public.producto              enable row level security;
alter table public.inventario            enable row level security;
alter table public.movimiento_inventario enable row level security;
alter table public.auditoria             enable row level security;
alter table public.detalle_auditoria     enable row level security;
alter table public.reconocimiento_ia     enable row level security;
alter table public.alerta                enable row level security;
alter table public.prediccion            enable row level security;

-- rol
create policy rol_select on public.rol for select to authenticated using (true);

-- perfil: cada quien ve el suyo; el admin ve y edita todos
create policy perfil_select on public.perfil for select to authenticated
  using (id = auth.uid() or public.es_admin());
create policy perfil_update_admin on public.perfil for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- producto: lectura para autenticados, escritura solo admin
create policy producto_select on public.producto for select to authenticated using (true);
create policy producto_insert on public.producto for insert to authenticated with check (public.es_admin());
create policy producto_update on public.producto for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy producto_delete on public.producto for delete to authenticated using (public.es_admin());

-- inventario: solo lectura (se escribe vía RPC / triggers)
create policy inventario_select on public.inventario for select to authenticated using (true);

-- movimientos: admin ve todos, el trabajador solo los suyos (inserta solo vía RPC)
create policy mov_select on public.movimiento_inventario for select to authenticated
  using (public.es_admin() or id_usuario = auth.uid());

-- auditorías
create policy aud_select on public.auditoria for select to authenticated
  using (public.es_admin() or id_usuario = auth.uid());
create policy aud_insert on public.auditoria for insert to authenticated
  with check (public.rol_actual() is not null and id_usuario = auth.uid());
create policy aud_update on public.auditoria for update to authenticated
  using (public.es_admin() or id_usuario = auth.uid())
  with check (public.es_admin() or id_usuario = auth.uid());

-- detalle: hereda acceso de la auditoría padre (el subselect aplica su RLS)
create policy det_all on public.detalle_auditoria for all to authenticated
  using (exists (select 1 from public.auditoria a where a.id_auditoria = detalle_auditoria.id_auditoria))
  with check (exists (select 1 from public.auditoria a where a.id_auditoria = detalle_auditoria.id_auditoria));

-- reconocimiento IA
create policy reco_select on public.reconocimiento_ia for select to authenticated
  using (public.es_admin() or id_usuario = auth.uid());
create policy reco_insert on public.reconocimiento_ia for insert to authenticated
  with check (public.rol_actual() is not null and id_usuario = auth.uid());
create policy reco_update on public.reconocimiento_ia for update to authenticated
  using (public.es_admin() or id_usuario = auth.uid())
  with check (public.es_admin() or id_usuario = auth.uid());

-- alertas y predicciones: lectura autenticados; escritura admin (el servicio IA usa service_role)
create policy alerta_select on public.alerta for select to authenticated using (true);
create policy alerta_update on public.alerta for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy pred_select on public.prediccion for select to authenticated using (true);
create policy pred_write  on public.prediccion for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
