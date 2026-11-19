import { useState } from 'react'
import { t } from '../../i18n'

export default function Field({ label, id, type = 'text', className = '', inputRef, ...props }) {
  const [ver, setVer] = useState(false)
  const esPassword = type === 'password'

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          ref={inputRef}
          type={esPassword && ver ? 'text' : type}
          {...props}
          className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30 ${esPassword ? 'pr-20' : ''}`}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-brand hover:text-brand-tech"
            aria-label={ver ? t('comun.ocultarPassword') : t('comun.mostrarPassword')}
          >
            {ver ? t('comun.ocultar') : t('comun.mostrar')}
          </button>
        )}
      </div>
    </div>
  )
}
