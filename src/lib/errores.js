import { t } from '../i18n'

// Traduce errores de Supabase Auth a mensajes claros en español.
export function traducirError(error) {
  const msg = (error?.message ?? '').toLowerCase()
  if (msg.includes('invalid login credentials')) return t('errores.credenciales')
  if (msg.includes('email not confirmed')) return t('errores.noConfirmado')
  if (msg.includes('already registered')) return t('errores.yaRegistrado')
  if (msg.includes('password should be')) return t('errores.passwordReq')
  if (msg.includes('different from the old')) return t('errores.passwordIgual')
  if (msg.includes('rate limit') || msg.includes('too many')) return t('errores.limite')
  if (msg.includes('failed to fetch') || msg.includes('network')) return t('errores.red')
  return t('errores.inesperado')
}

// Errores de base de datos / PostgREST
export function traducirErrorDB(error) {
  if (error?.parcial) return error.message
  const code = error?.code
  const msg = (error?.message ?? '').toLowerCase()
  if (code === '23505') return t('errores.codigoDuplicado')
  if (code === '42501' || msg.includes('row-level security')) return t('errores.permisos')
  if (code === '23514') return t('errores.rango')
  if (code === 'P0001') return error.message // mensajes propios de las funciones SQL (ya en español)
  if (['PGRST202', 'PGRST205', '42883', '42P01'].includes(code))
    return t('errores.migracion')
  if (msg.includes('failed to fetch') || msg.includes('network')) return t('errores.red')
  return t('errores.operacion')
}
