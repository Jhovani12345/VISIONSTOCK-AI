import { supabase } from '../lib/supabase'

export const CONFIG_DEFECTO = {
  nombre_almacen: 'Almacén principal',
  dias_cobertura: 15,
  ventana_analisis: 30,
  dias_alerta_reabasto: 7,
  stock_minimo_predeterminado: 0,
  unidades_medida: ['PIEZA', 'CAJA', 'PAQUETE', 'KG', 'LITRO', 'METRO'],
}

let cache = null

// Si la tabla aún no existe (migración 007 pendiente) se usan los valores por defecto.
export async function obtenerConfiguracion({ forzar = false } = {}) {
  if (cache && !forzar) return cache
  const { data, error } = await supabase.from('configuracion').select('*').eq('id', 1).maybeSingle()
  if (error) {
    console.warn('No se pudo leer la configuración; se usan valores por defecto.', error.message)
    return { ...CONFIG_DEFECTO }
  }
  cache = { ...CONFIG_DEFECTO, ...(data ?? {}) }
  return cache
}

export async function guardarConfiguracion(cambios) {
  const { data, error } = await supabase.from('configuracion').update(cambios).eq('id', 1).select().single()
  if (error) throw error
  cache = { ...CONFIG_DEFECTO, ...data }
  return cache
}
