import { getLocale } from '../i18n'

// Los formateadores se crean por idioma y se reutilizan.
const cache = {}
function fmt(clave, crear) {
  const loc = getLocale()
  const k = `${loc}|${clave}`
  return (cache[k] ??= crear(loc))
}

const num = () => fmt('num', (l) => new Intl.NumberFormat(l, { maximumFractionDigits: 2 }))
const fecha = () => fmt('fecha', (l) => new Intl.DateTimeFormat(l, { dateStyle: 'short', timeStyle: 'short' }))
const fechaLarga = () => fmt('larga', (l) => new Intl.DateTimeFormat(l, { day: 'numeric', month: 'short', year: 'numeric' }))
const diaMes = () => fmt('diames', (l) => new Intl.DateTimeFormat(l, { day: '2-digit', month: 'short' }))
const relativa = () => fmt('rel', (l) => new Intl.RelativeTimeFormat(l, { numeric: 'auto' }))

export const fmtNum = (n) => num().format(Number(n ?? 0))
export const fmtFecha = (iso) => (iso ? fecha().format(new Date(iso)) : '—')
export const fmtFechaLarga = (iso) => (iso ? fechaLarga().format(new Date(iso)).replace(/\./g, '') : '—')
export const fmtDiaMes = (d) => diaMes().format(d).replace('.', '')

// Hoy / Ayer / 12 sep  (Today / Yesterday / Sep 12)
export function fmtFechaRelativa(iso) {
  const d = new Date(iso)
  const dia = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((dia(new Date()) - dia(d)) / 86400000)
  if (diff === 0 || diff === 1) {
    const s = relativa().format(-diff, 'day')
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  return fmtDiaMes(d)
}

// Nombre corto del día: Lun / Mon
export function fmtDiaSemana(d) {
  const s = fmt('sem', (l) => new Intl.DateTimeFormat(l, { weekday: 'short' })).format(d).replace('.', '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
