import { supabase } from '../lib/supabase'

const SELECT =
  'id_alerta, tipo_alerta, mensaje, estado, fecha_alerta, producto!inner(id_producto, nombre, codigo_barras, unidad_medida, ubicacion, stock_minimo, activo, inventario(cantidad_actual))'

export async function listarAlertas({ estado = 'ACTIVA', tipo = 'TODOS', pagina = 1, porPagina = 10 } = {}) {
  let q = supabase
    .from('alerta')
    .select(SELECT, { count: 'exact' })
    .order('fecha_alerta', { ascending: false })
    .order('id_alerta', { ascending: false })
  if (estado !== 'TODOS') q = q.eq('estado', estado)
  if (tipo !== 'TODOS') q = q.eq('tipo_alerta', tipo)

  const desde = (pagina - 1) * porPagina
  const { data, error, count } = await q.range(desde, desde + porPagina - 1)
  if (error) throw error
  return { filas: data ?? [], total: count ?? 0 }
}

export async function contarAlertasActivas() {
  const cuenta = (tipo) =>
    supabase.from('alerta').select('id_alerta', { count: 'exact', head: true }).eq('estado', 'ACTIVA').eq('tipo_alerta', tipo)
  const [a, b] = await Promise.all([cuenta('AGOTADO'), cuenta('STOCK_BAJO')])
  if (a.error) throw a.error
  if (b.error) throw b.error
  return { agotado: a.count ?? 0, stock_bajo: b.count ?? 0 }
}

// Marcar como atendida (p. ej. ya se pidió al proveedor). Si el stock vuelve a cambiar
// y sigue bajo, el trigger de inventario generará una alerta nueva.
export async function atenderAlerta(id) {
  const { error } = await supabase.from('alerta').update({ estado: 'ATENDIDA' }).eq('id_alerta', id).eq('estado', 'ACTIVA')
  if (error) throw error
}
