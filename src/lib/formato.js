const num = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })
const fecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' })

export const fmtNum = (n) => num.format(Number(n ?? 0))
export const fmtFecha = (iso) => (iso ? fecha.format(new Date(iso)) : '—')
