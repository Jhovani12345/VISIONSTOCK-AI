const VARIANTES = {
  primario: 'bg-brand-tech text-white hover:brightness-110 active:brightness-95',
  secundario: 'bg-brand text-white hover:brightness-110 active:brightness-95',
  exito: 'bg-brand-ia text-white hover:brightness-110 active:brightness-95',
  peligro: 'bg-danger text-white hover:brightness-110 active:brightness-95',
  suave: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
}

export default function Button({ variante = 'primario', cargando = false, className = '', children, disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-tech focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${className}`}
    >
      {cargando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  )
}
