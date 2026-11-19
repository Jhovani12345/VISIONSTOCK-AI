import { supabase } from '../lib/supabase'

const limpiar = (t) => t.replace(/[,()%*\\"']/g, ' ').trim()
const SELECT = 'id, nombre, apellido, correo, activo, fecha_registro, rol!inner(id_rol, nombre_rol)'

export async function listarRoles() {
  const { data, error } = await supabase.from('rol').select('id_rol, nombre_rol').order('id_rol')
  if (error) throw error
  return data ?? []
}

export async function listarUsuarios({ busqueda = '', rol = 'TODOS', estado = 'TODOS', pagina = 1, porPagina = 10 }) {
  let q = supabase.from('perfil').select(SELECT, { count: 'exact' }).order('nombre', { ascending: true })

  if (rol !== 'TODOS') q = q.eq('rol.nombre_rol', rol)
  if (estado !== 'TODOS') q = q.eq('activo', estado === 'ACTIVO')

  const t = limpiar(busqueda)
  if (t) q = q.or(`nombre.ilike.%${t}%,apellido.ilike.%${t}%,correo.ilike.%${t}%`)

  const desde = (pagina - 1) * porPagina
  const { data, error, count } = await q.range(desde, desde + porPagina - 1)
  if (error) throw error
  return { filas: data ?? [], total: count ?? 0 }
}

export async function actualizarUsuario(id, cambios) {
  const { error } = await supabase.from('perfil').update(cambios).eq('id', id)
  if (error) throw error
}

// Crear usuarios requiere la service_role key: se hace en la Edge Function `crear-usuario`.
export async function crearUsuario(datos) {
  const { data, error } = await supabase.functions.invoke('crear-usuario', { body: datos })
  if (error) {
    let msg = 'No se pudo crear el usuario.'
    if (error.name === 'FunctionsFetchError') {
      msg = 'No se pudo contactar la función «crear-usuario». Verifica que esté desplegada en Supabase.'
    } else {
      try {
        const j = await error.context.json()
        if (j?.error) msg = j.error
      } catch { /* respuesta sin JSON */ }
    }
    throw Object.assign(new Error(msg), { code: 'P0001' })
  }
  return data
}
