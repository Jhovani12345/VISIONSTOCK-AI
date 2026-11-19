-- ============================================================
-- VisionStock AI · Migración 002
-- 1) Al cambiar stock_minimo se reevalúan las alertas del producto.
-- 2) Al dar de baja un producto se cancelan sus alertas activas.
-- ============================================================
create or replace function public.reevaluar_alerta_por_minimo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Tocar cantidad_actual dispara trg_inventario_alerta
  update public.inventario set cantidad_actual = cantidad_actual
  where id_producto = new.id_producto;
  return new;
end $$;

create trigger trg_producto_minimo
  after update of stock_minimo on public.producto
  for each row
  when (old.stock_minimo is distinct from new.stock_minimo)
  execute function public.reevaluar_alerta_por_minimo();

create or replace function public.cancelar_alertas_baja()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.alerta set estado = 'CANCELADA'
  where id_producto = new.id_producto and estado = 'ACTIVA';
  return new;
end $$;

create trigger trg_producto_baja
  after update of activo on public.producto
  for each row
  when (old.activo and not new.activo)
  execute function public.cancelar_alertas_baja();
