import { supabase } from '../lib/supabase'

export async function obtenerPreferencias(idUsuario) {
  const { data, error } = await supabase
    .from('preferencia_usuario')
    .select('tema, idioma, tipografia, tamano, color')
    .eq('id_usuario', idUsuario)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function guardarPreferencias(idUsuario, p) {
  const { error } = await supabase
    .from('preferencia_usuario')
    .upsert({ id_usuario: idUsuario, ...p }, { onConflict: 'id_usuario' })
  if (error) throw error
}
