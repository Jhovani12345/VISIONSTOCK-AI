import { supabase } from '../lib/supabase'

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'

export async function obtenerAnalisis(dias = 30) {
  const { data, error } = await supabase.rpc('analisis_consumo', { p_dias: dias, p_tz: tz() })
  if (error) throw error
  return data
}

export async function guardarPredicciones(dias = 30) {
  const { data, error } = await supabase.rpc('guardar_predicciones', { p_dias: dias, p_tz: tz() })
  if (error) throw error
  return data
}
