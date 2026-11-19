export default function AuthButton({ cargando = false, invertido = false, className = '', children, disabled, ...props }) {
  // Degradado acotado para mantener contraste legible del texto blanco.
  const grad = invertido ? 'from-cyan-600 to-cyan-800' : 'from-cyan-800 to-cyan-600'
  return (
    <button
      {...props}
      disabled={disabled || cargando}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${grad} px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.30)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {cargando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  )
}
