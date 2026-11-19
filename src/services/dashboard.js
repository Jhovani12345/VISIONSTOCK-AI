import { supabase } from '../lib/supabase'

const ratio = (p) => (Number(p.stock_minimo) > 0 ? Number(p.cantidad_actual) / Number(p.stock_minimo) : 0)

export async function obtenerDashboard() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'

  const [resumen, movs, alertas] = await Promise.all([
    supabase.rpc('resumen_dashboard', { p_tz: tz }),
    supabase
      .from('movimiento_inventario')
      .select('id_movimiento, tipo_movimiento, cantidad, fecha_movimiento, producto(nombre, unidad_medida)')
      .order('fecha_movimiento', { ascending: false })
      .order('id_movimiento', { ascending: false })
      .limit(5),
    supabase
      .from('vista_inventario')
      .select('id_producto, nombre, cantidad_actual, stock_minimo, estado, unidad_medida')
      .eq('activo', true)
      .in('estado', ['STOCK_BAJO', 'AGOTADO'])
      .limit(30),
  ])
  for (const r of [resumen, movs, alertas]) if (r.error) throw r.error

  // Agotados primero; dentro de cada grupo, el más crítico primero
  const lista = (alertas.data ?? []).sort((a, b) =>
    a.estado === b.estado ? ratio(a) - ratio(b) : a.estado === 'AGOTADO' ? -1 : 1
  )

  return { ...resumen.data, movimientos: movs.data ?? [], alertas: lista }
}
