const num = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })
const fecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' })

export const fmtNum = (n) => num.format(Number(n ?? 0))
export const fmtFecha = (iso) => (iso ? fecha.format(new Date(iso)) : '—')

const fechaLarga = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
const diaMes = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' })

export const fmtFechaLarga = (iso) => (iso ? fechaLarga.format(new Date(iso)).replace(/\./g, '') : '—')

// Hoy / Ayer / 12 sep
export function fmtFechaRelativa(iso) {
  const d = new Date(iso)
  const dia = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((dia(new Date()) - dia(d)) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return diaMes.format(d).replace('.', '')
}
