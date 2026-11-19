import { useEffect } from 'react'
import { t } from '../../i18n'

export default function Modal({ titulo, onCerrar, children, ancho = 'max-w-lg' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', onKey)
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previo
    }
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`max-h-[92vh] w-full ${ancho} overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">{titulo}</h2>
          <button onClick={onCerrar} aria-label={t('comun.cerrar')} className="rounded-lg px-2 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
