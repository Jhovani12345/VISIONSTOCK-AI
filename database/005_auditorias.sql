-- ============================================================
-- VisionStock AI · Migración 005 · Auditorías de inventario
-- Flujo: iniciar -> registrar conteos -> finalizar (con ajuste opcional) | cancelar
-- Todas las operaciones validan que la auditoría siga EN_PROCESO.
-- ============================================================

alter table public.auditoria
  add column if not exists fecha_cierre    timestamptz,
  add column if not exists ajuste_aplicado boolean not null default false;

-- Solo puede haber una auditoría en proceso a la vez
create unique index if not exists uq_auditoria_en_proceso
  on public.auditoria ((true)) where estado = 'EN_PROCESO';

-- Bloquea la auditoría y comprueba permisos y estado
create or replace function public._auditoria_editable(p_id bigint)
returns public.auditoria
language plpgsql security definer set search_path = public as $$
declare v public.auditoria;
begin
  if not public.es_admin() then
    raise exception 'Solo el administrador puede gestionar auditorías.' using errcode = 'P0001';
  end if;
  select * into v from public.auditoria where id_auditoria = p_id for update;
  if not found then
    raise exception 'La auditoría no existe.';
  end if;
  if v.estado <> 'EN_PROCESO' then
    raise exception 'La auditoría ya está cerrada y no admite cambios.';
  end if;
  return v;
end $$;

-- 1. Iniciar ---------------------------------------------------
create or replace function public.iniciar_auditoria(p_observaciones text default null)
returns public.auditoria
language plpgsql security definer set search_path = public as $$
declare v public.auditoria;
begin
  if not public.es_admin() then
    raise exception 'Solo el administrador puede gestionar auditorías.';
  end if;
  if exists (select 1 from public.auditoria where estado = 'EN_PROCESO') then
    raise exception 'Ya hay una auditoría en proceso. Finalízala o cancélala antes de iniciar otra.';
  end if;
  insert into public.auditoria (id_usuario, observaciones)
  values (auth.uid(), nullif(trim(p_observaciones), ''))
  returning * into v;
  return v;
end $$;

-- 2. Registrar / corregir el conteo físico de un producto ------
-- cantidad_sistema se toma del inventario en el momento del conteo.
create or replace function public.registrar_conteo(
  p_id_auditoria    bigint,
  p_id_producto     bigint,
  p_cantidad_fisica numeric,
  p_metodo          text default 'MANUAL'
) returns public.detalle_auditoria
language plpgsql security definer set search_path = public as $$
declare
  v_sistema numeric;
  v_det     public.detalle_auditoria;
begin
  perform public._auditoria_editable(p_id_auditoria);

  if p_cantidad_fisica is null or p_cantidad_fisica < 0 then
    raise exception 'La cantidad contada debe ser mayor o igual a cero.';
  end if;
  if coalesce(p_metodo, '') not in ('MANUAL', 'IA') then
    raise exception 'Método de conteo inválido.';
  end if;

  select i.cantidad_actual into v_sistema
  from public.inventario i
  join public.producto p on p.id_producto = i.id_producto
  where i.id_producto = p_id_producto and p.activo;
  if not found then
    raise exception 'Producto no encontrado o inactivo.';
  end if;

  insert into public.detalle_auditoria (id_auditoria, id_producto, cantidad_sistema, cantidad_fisica, metodo_conteo)
  values (p_id_auditoria, p_id_producto, v_sistema, p_cantidad_fisica, p_metodo)
  on conflict (id_auditoria, id_producto) do update
    set cantidad_sistema = excluded.cantidad_sistema,
        cantidad_fisica  = excluded.cantidad_fisica,
        metodo_conteo    = excluded.metodo_conteo
  returning * into v_det;

  return v_det;
end $$;

-- 3. Quitar un conteo -----------------------------------------
create or replace function public.eliminar_conteo(p_id_detalle bigint)
returns void
language plpgsql security definer set search_path = public as $$
declare v_aud bigint;
begin
  select id_auditoria into v_aud from public.detalle_auditoria where id_detalle = p_id_detalle;
  if not found then
    raise exception 'El conteo no existe.';
  end if;
  perform public._auditoria_editable(v_aud);
  delete from public.detalle_auditoria where id_detalle = p_id_detalle;
end $$;

-- 4. Finalizar ------------------------------------------------
-- Si p_ajustar = true, cada diferencia se aplica al inventario como
-- ENTRADA/SALIDA ("Ajuste por auditoría #N") para que quede en el historial.
-- Se aplica la diferencia (no se sobreescribe la existencia), así se respetan
-- los movimientos ocurridos entre el conteo y el cierre.
create or replace function public.finalizar_auditoria(p_id_auditoria bigint, p_ajustar boolean default false)
returns public.auditoria
language plpgsql security definer set search_path = public as $$
declare
  v     public.auditoria;
  d     record;
  v_stk numeric;
  v_qty numeric;
begin
  perform public._auditoria_editable(p_id_auditoria);

  if not exists (select 1 from public.detalle_auditoria where id_auditoria = p_id_auditoria) then
    raise exception 'Registra al menos un conteo antes de finalizar.';
  end if;

  if p_ajustar then
    for d in
      select id_producto, diferencia from public.detalle_auditoria
      where id_auditoria = p_id_auditoria and diferencia <> 0
      order by id_producto
    loop
      select cantidad_actual into v_stk from public.inventario
      where id_producto = d.id_producto for update;

      v_qty := case when d.diferencia > 0 then d.diferencia else least(-d.diferencia, v_stk) end;
      continue when v_qty <= 0;

      update public.inventario
      set cantidad_actual = cantidad_actual + case when d.diferencia > 0 then v_qty else -v_qty end,
          fecha_actualizacion = now()
      where id_producto = d.id_producto;

      insert into public.movimiento_inventario (id_producto, id_usuario, tipo_movimiento, cantidad, observaciones)
      values (d.id_producto, auth.uid(),
              case when d.diferencia > 0 then 'ENTRADA' else 'SALIDA' end,
              v_qty, format('Ajuste por auditoría #%s', p_id_auditoria));
    end loop;
  end if;

  update public.detalle_auditoria set confirmado = true where id_auditoria = p_id_auditoria;

  update public.auditoria
  set estado = 'FINALIZADA', fecha_cierre = now(), ajuste_aplicado = coalesce(p_ajustar, false)
  where id_auditoria = p_id_auditoria
  returning * into v;
  return v;
end $$;

-- 5. Cancelar -------------------------------------------------
create or replace function public.cancelar_auditoria(p_id_auditoria bigint)
returns public.auditoria
language plpgsql security definer set search_path = public as $$
declare v public.auditoria;
begin
  perform public._auditoria_editable(p_id_auditoria);
  update public.auditoria
  set estado = 'CANCELADA', fecha_cierre = now()
  where id_auditoria = p_id_auditoria
  returning * into v;
  return v;
end $$;

-- Resumen por auditoría para el listado (hereda RLS)
create or replace view public.vista_auditoria with (security_invoker = true) as
select a.id_auditoria, a.fecha_auditoria, a.fecha_cierre, a.estado, a.observaciones, a.ajuste_aplicado,
       a.id_usuario, trim(pf.nombre || ' ' || pf.apellido) as responsable,
       count(d.id_detalle)                              as productos_revisados,
       count(d.id_detalle) filter (where d.diferencia <> 0) as diferencias,
       coalesce(sum(d.diferencia) filter (where d.diferencia > 0), 0) as sobrantes,
       coalesce(-sum(d.diferencia) filter (where d.diferencia < 0), 0) as faltantes
from public.auditoria a
join public.perfil pf on pf.id = a.id_usuario
left join public.detalle_auditoria d on d.id_auditoria = a.id_auditoria
group by a.id_auditoria, pf.nombre, pf.apellido;

-- Permisos
revoke all on function public._auditoria_editable(bigint) from public, anon, authenticated;
revoke all on function public.iniciar_auditoria(text)                         from public, anon;
revoke all on function public.registrar_conteo(bigint, bigint, numeric, text) from public, anon;
revoke all on function public.eliminar_conteo(bigint)                         from public, anon;
revoke all on function public.finalizar_auditoria(bigint, boolean)            from public, anon;
revoke all on function public.cancelar_auditoria(bigint)                      from public, anon;
grant execute on function public.iniciar_auditoria(text)                         to authenticated;
grant execute on function public.registrar_conteo(bigint, bigint, numeric, text) to authenticated;
grant execute on function public.eliminar_conteo(bigint)                         to authenticated;
grant execute on function public.finalizar_auditoria(bigint, boolean)            to authenticated;
grant execute on function public.cancelar_auditoria(bigint)                      to authenticated;
