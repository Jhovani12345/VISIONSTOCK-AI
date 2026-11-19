import { supabase } from '../lib/supabase'

const LOTE = 1000 // límite por respuesta de PostgREST
const MAXIMO = 50000

// Recorre todas las páginas de una consulta. `crear` debe devolver una consulta nueva en cada llamada.
async function traerTodo(crear) {
  const filas = []
  for (let desde = 0; desde < MAXIMO; desde += LOTE) {
    const { data, error } = await crear().range(desde, desde + LOTE - 1)
    if (error) throw error
    filas.push(...(data ?? []))
    if (!data || data.length < LOTE) break
  }
  return filas
}

// 'YYYY-MM-DD' (hora local) -> ISO. `fin` = inicio del día siguiente (límite exclusivo).
const inicioDia = (f) => new Date(`${f}T00:00:00`).toISOString()
const finDia = (f) => {
  const d = new Date(`${f}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return d.toISOString()
}

export function reporteInventario({ estado = 'TODOS', incluirBajas = false }) {
  return traerTodo(() => {
    let q = supabase.from('vista_inventario').select('*').order('nombre').order('id_producto')
    if (!incluirBajas) q = q.eq('activo', true)
    if (estado !== 'TODOS') q = q.eq('estado', estado)
    return q
  })
}

export function reporteMovimientos({ desde, hasta, tipo = 'TODOS' }) {
  return traerTodo(() => {
    let q = supabase
      .from('movimiento_inventario')
      .select('id_movimiento, tipo_movimiento, cantidad, fecha_movimiento, observaciones, producto(codigo_barras, nombre, unidad_medida), perfil(nombre, apellido, correo)')
      .order('fecha_movimiento', { ascending: false })
      .order('id_movimiento', { ascending: false })
    if (desde) q = q.gte('fecha_movimiento', inicioDia(desde))
    if (hasta) q = q.lt('fecha_movimiento', finDia(hasta))
    if (tipo !== 'TODOS') q = q.eq('tipo_movimiento', tipo)
    return q
  })
}

export function reporteAuditorias({ desde, hasta, estado = 'TODOS' }) {
  return traerTodo(() => {
    let q = supabase
      .from('detalle_auditoria')
      .select('id_detalle, cantidad_sistema, cantidad_fisica, diferencia, metodo_conteo, producto(codigo_barras, nombre, unidad_medida), auditoria!inner(id_auditoria, fecha_auditoria, fecha_cierre, estado, perfil(nombre, apellido))')
      .order('id_auditoria', { ascending: false })
      .order('id_detalle')
    if (desde) q = q.gte('auditoria.fecha_auditoria', inicioDia(desde))
    if (hasta) q = q.lt('auditoria.fecha_auditoria', finDia(hasta))
    if (estado !== 'TODOS') q = q.eq('auditoria.estado', estado)
    return q
  })
}
