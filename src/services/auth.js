import { supabase } from '../lib/supabase'

// Envía el correo con el enlace de recuperación. Supabase no revela si el correo existe.
export async function solicitarRecuperacion(correo) {
  const { error } = await supabase.auth.resetPasswordForEmail(correo, {
    redirectTo: `${window.location.origin}/restablecer`,
  })
  if (error) throw error
}

// Requiere sesión (la de recuperación o una normal).
export async function cambiarPassword(nueva) {
  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) throw error
}
