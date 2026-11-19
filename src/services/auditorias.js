import { supabase } from '../lib/supabase'

export async function listarAuditorias({ estado = 'TODOS', pagina = 1, porPagina = 10 } = {}) {
  let q = supabase
    .from('vista_auditoria')
    .select('*', { count: 'exact' })
    .order('fecha_auditoria', { ascending: false })
    .order('id_auditoria', { ascending: false })
  if (estado !== 'TODOS') q = q.eq('estado', estado)

  const desde = (pagina - 1) * porPagina
  const { data, error, count } = await q.range(desde, desde + porPagina - 1)
  if (error) throw error
  return { filas: data ?? [], total: count ?? 0 }
}

export async function obtenerAuditoria(id) {
  const [cab, det] = await Promise.all([
    supabase.from('vista_auditoria').select('*').eq('id_auditoria', id).maybeSingle(),
    supabase
      .from('detalle_auditoria')
      .select('id_detalle, id_producto, cantidad_sistema, cantidad_fisica, diferencia, metodo_conteo, confirmado, producto(nombre, codigo_barras, unidad_medida, ubicacion)')
      .eq('id_auditoria', id)
      .order('id_detalle', { ascending: false }),
  ])
  if (cab.error) throw cab.error
  if (det.error) throw det.error
  return { auditoria: cab.data, detalle: det.data ?? [] }
}

async function rpc(nombre, args) {
  const { data, error } = await supabase.rpc(nombre, args)
  if (error) throw error
  return data
}

export const iniciarAuditoria = (observaciones) => rpc('iniciar_auditoria', { p_observaciones: observaciones || null })

export const registrarConteo = (id_auditoria, id_producto, cantidad) =>
  rpc('registrar_conteo', { p_id_auditoria: id_auditoria, p_id_producto: id_producto, p_cantidad_fisica: cantidad, p_metodo: 'MANUAL' })

export const eliminarConteo = (id_detalle) => rpc('eliminar_conteo', { p_id_detalle: id_detalle })

export const finalizarAuditoria = (id, ajustar) => rpc('finalizar_auditoria', { p_id_auditoria: id, p_ajustar: ajustar })

export const cancelarAuditoria = (id) => rpc('cancelar_auditoria', { p_id_auditoria: id })
