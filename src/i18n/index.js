import es from './es'
import en from './en'

// Traducción a nivel de módulo: al cambiar el idioma, PreferenciasProvider vuelve a
// montar la app, así que basta con llamar a t() durante el render.
const DICCIONARIOS = { es, en }
let idioma = 'es'

export const IDIOMAS = { es: 'Español', en: 'English' }

export function setIdioma(i) {
  idioma = DICCIONARIOS[i] ? i : 'es'
}

export const getIdioma = () => idioma
export const getLocale = () => (idioma === 'en' ? 'en-US' : 'es-MX')

const buscar = (dic, clave) => clave.split('.').reduce((o, p) => o?.[p], dic)

// t('nav.inventario') · t('pag.mostrando', { desde: 1, hasta: 10, total: 30 })
export function t(clave, vars) {
  let s = buscar(DICCIONARIOS[idioma], clave) ?? buscar(es, clave) ?? clave
  if (vars && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
  return s
}
