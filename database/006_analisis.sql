-- ============================================================
-- VisionStock AI · Migración 006 · Análisis de consumo y predicciones
-- Modelo: promedio móvil simple de las salidas en los últimos N días.
--   promedio diario   = salidas del periodo / N
--   días de existencia = existencia actual / promedio diario
-- Los ajustes por auditoría no cuentan como consumo.
-- ============================================================

create or replace function public.analisis_consumo(p_dias int default 30, p_tz text default 'America/Mexico_City')
returns jsonb
language plpgsql stable security invoker set search_path = public as $$
declare
  v_hoy   date := (now() at time zone p_tz)::date;
  v_desde date;
  v_ini   timestamptz;
  v_serie jsonb;
  v_prod  jsonb;
  v_ult   timestamptz;
begin
  if p_dias is null or p_dias < 1 or p_dias > 365 then
    raise exception 'El periodo debe estar entre 1 y 365 días.';
  end if;
  v_desde := v_hoy - (p_dias - 1);
  v_ini   := v_desde::timestamp at time zone p_tz;

  -- Serie diaria de entradas y salidas
  select jsonb_agg(jsonb_build_object('fecha', g.dia, 'entradas', coalesce(m.entradas, 0), 'salidas', coalesce(m.salidas, 0)) order by g.dia)
    into v_serie
  from (select v_desde + n as dia from generate_series(0, p_dias - 1) n) g
  left join (
    select (fecha_movimiento at time zone p_tz)::date as dia,
           sum(cantidad) filter (where tipo_movimiento = 'ENTRADA') as entradas,
           sum(cantidad) filter (where tipo_movimiento = 'SALIDA')  as salidas
    from movimiento_inventario
    where fecha_movimiento >= v_ini
      and coalesce(observaciones, '') not like 'Ajuste por auditoría%'
    group by 1
  ) m on m.dia = g.dia;

  -- Consumo y proyección por producto activo
  select jsonb_agg(to_jsonb(x) order by x.dias_existencia nulls last, x.consumo desc, x.nombre)
    into v_prod
  from (
    select p.id_producto, p.nombre, p.codigo_barras, p.unidad_medida, p.ubicacion, p.stock_minimo,
           i.cantidad_actual as stock,
           coalesce(c.consumo, 0) as consumo,
           round(coalesce(c.consumo, 0) / p_dias, 2) as promedio,
           case when coalesce(c.consumo, 0) > 0
                then round(i.cantidad_actual / (c.consumo / p_dias), 1) end as dias_existencia,
           c.ultima_salida
    from producto p
    join inventario i on i.id_producto = p.id_producto
    left join (
      select id_producto, sum(cantidad) as consumo, max(fecha_movimiento) as ultima_salida
      from movimiento_inventario
      where tipo_movimiento = 'SALIDA'
        and fecha_movimiento >= v_ini
        and coalesce(observaciones, '') not like 'Ajuste por auditoría%'
      group by id_producto
    ) c on c.id_producto = p.id_producto
    where p.activo
  ) x;

  select max(fecha_prediccion) into v_ult from prediccion;

  return jsonb_build_object(
    'dias', p_dias,
    'serie', coalesce(v_serie, '[]'::jsonb),
    'productos', coalesce(v_prod, '[]'::jsonb),
    'ultima_prediccion', v_ult
  );
end $$;

-- Guarda una "foto" de la proyección en la tabla prediccion (solo admin).
create or replace function public.guardar_predicciones(p_dias int default 30, p_tz text default 'America/Mexico_City')
returns int
language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  if not public.es_admin() then
    raise exception 'Solo el administrador puede guardar predicciones.';
  end if;

  insert into public.prediccion (id_producto, consumo_estimado, dias_existencia)
  select (e->>'id_producto')::bigint, (e->>'promedio')::numeric, (e->>'dias_existencia')::numeric
  from jsonb_array_elements(public.analisis_consumo(p_dias, p_tz)->'productos') e
  where (e->>'promedio')::numeric > 0;

  get diagnostics v_n = row_count;
  return v_n;
end $$;

revoke all on function public.analisis_consumo(int, text)     from public, anon;
revoke all on function public.guardar_predicciones(int, text) from public, anon;
grant execute on function public.analisis_consumo(int, text)     to authenticated;
grant execute on function public.guardar_predicciones(int, text) to authenticated;
