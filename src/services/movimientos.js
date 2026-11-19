import { supabase } from '../lib/supabase'

const SELECT =
  'id_movimiento, tipo_movimiento, cantidad, fecha_movimiento, observaciones, producto(nombre, codigo_barras, unidad_medida), perfil(nombre, apellido)'

export async function listarMovimientos({ tipo = 'TODOS', pagina = 1, porPagina = 10 } = {}) {
  let q = supabase
    .from('movimiento_inventario')
    .select(SELECT, { count: 'exact' })
    .order('fecha_movimiento', { ascending: false })
    .order('id_movimiento', { ascending: false })
  if (tipo !== 'TODOS') q = q.eq('tipo_movimiento', tipo)

  const desde = (pagina - 1) * porPagina
  const { data, error, count } = await q.range(desde, desde + porPagina - 1)
  if (error) throw error
  return { filas: data ?? [], total: count ?? 0 }
}

// Operación atómica en la base de datos (valida stock, actualiza inventario y guarda historial)
export async function registrarMovimiento({ id_producto, tipo, cantidad, observaciones }) {
  const { data, error } = await supabase.rpc('registrar_movimiento', {
    p_id_producto: id_producto,
    p_tipo: tipo,
    p_cantidad: cantidad,
    p_observaciones: observaciones || null,
  })
  if (error) throw error
  return data
}
