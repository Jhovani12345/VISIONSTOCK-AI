export default function Card({ titulo, subtitulo, accion, children, className = '' }) {
  return (
    <section className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>
      {(titulo || accion) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">{titulo}</h2>
            {subtitulo && <p className="text-xs text-slate-500">{subtitulo}</p>}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  )
}
