import { t } from '../../i18n'

const CLARO = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  exito: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
}
const OSCURO = {
  error: 'bg-red-500/10 text-red-200 ring-red-400/30',
  exito: 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/30',
  info: 'bg-cyan-500/10 text-cyan-100 ring-cyan-400/30',
}

// El color nunca es el único medio: siempre lleva etiqueta de texto.
export default function Alert({ tipo = 'info', oscuro = false, children }) {
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-sm ring-1 ${(oscuro ? OSCURO : CLARO)[tipo]}`}>
      <span className="font-semibold">{t(`alerta.${tipo}`)}: </span>
      {children}
    </div>
  )
}
