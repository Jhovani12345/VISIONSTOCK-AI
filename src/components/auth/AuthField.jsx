import { useState } from 'react'

export default function AuthField({ label, id, type = 'text', ocultarEtiqueta = false, ayuda, className = '', ...props }) {
  const [ver, setVer] = useState(false)
  const esPassword = type === 'password'

  return (
    <div className={className}>
      <label htmlFor={id} className={ocultarEtiqueta ? 'sr-only' : 'mb-1.5 block text-sm font-medium text-slate-100'}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={esPassword && ver ? 'text' : type}
          placeholder={ocultarEtiqueta ? label : undefined}
          {...props}
          className={`w-full rounded-xl border border-slate-600/60 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-400 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:shadow-[0_0_16px_rgba(34,211,238,0.25)] ${esPassword ? 'pr-24' : ''}`}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            {ver ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {ayuda && <p className="mt-1.5 text-xs text-slate-400">{ayuda}</p>}
    </div>
  )
}
