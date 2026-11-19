import { supabase } from '../lib/supabase'

// Quita caracteres que rompen la sintaxis del filtro .or() de PostgREST
const limpiar = (t) => t.replace(/[,()%*\\"']/g, ' ').trim()

export async function listarInventario({
  busqueda = '',
  estado = 'TODOS',
  pagina = 1,
  porPagina = 10,
  incluirInactivos = false,
}) {
  let q = supabase
    .from('vista_inventario')
    .select('*', { count: 'exact' })
    .order('nombre', { ascending: true })

  if (!incluirInactivos) q = q.eq('activo', true)
  if (estado !== 'TODOS') q = q.eq('estado', estado)

  const t = limpiar(busqueda)
  if (t) q = q.or(`nombre.ilike.%${t}%,codigo_barras.ilike.%${t}%`)

  const desde = (pagina - 1) * porPagina
  const { data, error, count } = await q.range(desde, desde + porPagina - 1)
  if (error) throw error
  return { filas: data ?? [], total: count ?? 0 }
}

// La existencia inicial se registra como ENTRADA para que quede en el historial.
export async function crearProducto({ existencia_inicial = 0, ...datos }) {
  const { data, error } = await supabase.from('producto').insert(datos).select().single()
  if (error) throw error

  if (existencia_inicial > 0) {
    const { error: e2 } = await supabase.rpc('registrar_movimiento', {
      p_id_producto: data.id_producto,
      p_tipo: 'ENTRADA',
      p_cantidad: existencia_inicial,
      p_observaciones: 'Existencia inicial',
    })
    if (e2) {
      const err = new Error(`El producto se creó, pero no se pudo registrar la existencia inicial: ${e2.message}`)
      err.parcial = true
      throw err
    }
  }
  return data
}

export async function actualizarProducto(id, datos) {
  const { error } = await supabase.from('producto').update(datos).eq('id_producto', id)
  if (error) throw error
}

// "Dar de baja" = baja lógica; conserva el historial de movimientos y auditorías.
export async function cambiarActivo(id, activo) {
  const { error } = await supabase.from('producto').update({ activo }).eq('id_producto', id)
  if (error) throw error
}

// ---- Búsqueda para formularios de movimientos ----
export async function buscarProductosActivos(texto, limite = 8) {
  const t = limpiar(texto)
  if (!t) return []
  const { data, error } = await supabase
    .from('vista_inventario')
    .select('*')
    .eq('activo', true)
    .or(`nombre.ilike.%${t}%,codigo_barras.ilike.%${t}%`)
    .order('nombre')
    .limit(limite)
  if (error) throw error
  return data ?? []
}

// Coincidencia exacta de código de barras (lector USB: teclea el código + Enter)
export async function buscarPorCodigo(codigo) {
  const { data, error } = await supabase
    .from('vista_inventario')
    .select('*')
    .eq('activo', true)
    .eq('codigo_barras', codigo.trim())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function obtenerProducto(id) {
  const { data, error } = await supabase.from('vista_inventario').select('*').eq('id_producto', id).single()
  if (error) throw error
  return data
}
