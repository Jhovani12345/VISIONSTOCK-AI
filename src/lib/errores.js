// Traduce errores de Supabase Auth a mensajes claros en español.
export function traducirError(error) {
  const msg = (error?.message ?? '').toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.'
  if (msg.includes('already registered')) return 'Ya existe una cuenta con ese correo.'
  if (msg.includes('password should be')) return 'La contraseña no cumple los requisitos mínimos.'
  if (msg.includes('different from the old')) return 'La nueva contraseña debe ser distinta a la anterior.'
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'No hay conexión con el servidor.'
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

// Errores de base de datos / PostgREST
export function traducirErrorDB(error) {
  if (error?.parcial) return error.message
  const code = error?.code
  const msg = (error?.message ?? '').toLowerCase()
  if (code === '23505') return 'Ya existe un producto con ese código de barras.'
  if (code === '42501' || msg.includes('row-level security')) return 'No tienes permisos para realizar esta acción.'
  if (code === '23514') return 'Algún valor está fuera del rango permitido.'
  if (code === 'P0001') return error.message // mensajes propios de las funciones SQL (ya en español)
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'No hay conexión con el servidor.'
  return 'No se pudo completar la operación. Inténtalo de nuevo.'
}
