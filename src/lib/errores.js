// Traduce errores de Supabase Auth a mensajes claros en español.
export function traducirError(error) {
  const msg = (error?.message ?? '').toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.'
  if (msg.includes('already registered')) return 'Ya existe una cuenta con ese correo.'
  if (msg.includes('password should be')) return 'La contraseña no cumple los requisitos mínimos.'
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'No hay conexión con el servidor.'
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
