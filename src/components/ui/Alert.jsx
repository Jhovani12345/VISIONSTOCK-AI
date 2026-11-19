const ESTILOS = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  exito: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
}
const ETIQUETAS = { error: 'Error', exito: 'Listo', info: 'Aviso' }

// El color nunca es el único medio: siempre lleva etiqueta de texto.
export default function Alert({ tipo = 'info', children }) {
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-sm ring-1 ${ESTILOS[tipo]}`}>
      <span className="font-semibold">{ETIQUETAS[tipo]}: </span>
      {children}
    </div>
  )
}
