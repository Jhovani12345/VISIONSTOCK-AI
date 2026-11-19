import { useEffect, useState } from 'react'
import { buscarPorCodigo, buscarProductosActivos } from '../../services/productos'
import { traducirErrorDB } from '../../lib/errores'
import { fmtNum } from '../../lib/formato'
import { useDebounce } from '../../hooks/useDebounce'
import Icon from './Icon'
import { t } from '../../i18n'

// Buscador con autocompletado. Enter = coincidencia exacta de código (lector USB).
export default function BuscadorProducto({ id = 'buscar-producto', label = t('comun.producto'), onSeleccionar, onError, autoFocus = false }) {
  const [texto, setTexto] = useState('')
  const q = useDebounce(texto, 250)
  const [resultados, setResultados] = useState([])
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!q.trim()) { setResultados([]); return }
    let cancelado = false
    buscarProductosActivos(q)
      .then((r) => !cancelado && setResultados(r))
      .catch(() => !cancelado && setResultados([]))
    return () => { cancelado = true }
  }, [q])

  function seleccionar(p) {
    setTexto('')
    setResultados([])
    setAbierto(false)
    onSeleccionar(p)
  }

  async function onEnter(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const cod = texto.trim()
    if (!cod) return
    try {
      const exacto = await buscarPorCodigo(cod)
      if (exacto) return seleccionar(exacto)
      if (resultados.length === 1) return seleccionar(resultados[0])
      if (resultados.length === 0) onError?.(t('buscador.noEncontrado'))
    } catch (err) {
      onError?.(traducirErrorDB(err))
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon name="buscar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          value={texto}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={t('buscador.placeholder')}
          onChange={(e) => { setTexto(e.target.value); setAbierto(true); onError?.('') }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onKeyDown={onEnter}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30"
        />
      </div>
      {abierto && resultados.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-slate-200">
          {resultados.map((p) => (
            <li key={p.id_producto}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); seleccionar(p) }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{p.nombre}</span>
                  <span className="block font-mono text-xs text-slate-500">{p.codigo_barras}</span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">{fmtNum(p.cantidad_actual)} {p.unidad_medida.toLowerCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
