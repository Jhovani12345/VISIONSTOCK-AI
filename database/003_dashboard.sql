-- ============================================================
-- VisionStock AI · Migración 003 · Resumen del dashboard
-- Una sola llamada devuelve KPIs, consumo de 7 días y última auditoría.
-- security invoker: respeta el RLS de quien consulta.
-- ============================================================
create or replace function public.resumen_dashboard(p_tz text default 'America/Mexico_City')
returns jsonb
language plpgsql stable security invoker set search_path = public as $$
declare
  v_hoy     date := (now() at time zone p_tz)::date;
  v_kpis    jsonb;
  v_consumo jsonb;
  v_aud     jsonb;
begin
  select jsonb_build_object(
           'total_productos',  count(*),
           'unidades_totales', coalesce(sum(i.cantidad_actual), 0),
           'stock_bajo', count(*) filter (where i.cantidad_actual > 0 and i.cantidad_actual <= p.stock_minimo),
           'agotados',   count(*) filter (where i.cantidad_actual <= 0))
    into v_kpis
  from producto p
  join inventario i on i.id_producto = p.id_producto
  where p.activo;

  -- Consumo = salidas por día (zona horaria del navegador), últimos 7 días
  select jsonb_agg(jsonb_build_object('fecha', x.dia, 'consumo', x.consumo) order by x.dia)
    into v_consumo
  from (
    select (v_hoy - (6 - n))::date as dia, coalesce(sum(m.cantidad), 0) as consumo
    from generate_series(0, 6) n
    left join movimiento_inventario m
      on m.tipo_movimiento = 'SALIDA'
     and (m.fecha_movimiento at time zone p_tz)::date = (v_hoy - (6 - n))
    group by n
  ) x;

  select jsonb_build_object(
           'fecha', a.fecha_auditoria,
           'responsable', trim(pf.nombre || ' ' || pf.apellido),
           'productos_revisados', (select count(*) from detalle_auditoria d where d.id_auditoria = a.id_auditoria),
           'diferencias', (select count(*) from detalle_auditoria d where d.id_auditoria = a.id_auditoria and d.diferencia <> 0))
    into v_aud
  from auditoria a
  join perfil pf on pf.id = a.id_usuario
  where a.estado = 'FINALIZADA'
  order by a.fecha_auditoria desc
  limit 1;

  return jsonb_build_object('kpis', v_kpis, 'consumo', v_consumo, 'ultima_auditoria', v_aud);
end $$;

revoke all on function public.resumen_dashboard(text) from public, anon;
grant execute on function public.resumen_dashboard(text) to authenticated;
