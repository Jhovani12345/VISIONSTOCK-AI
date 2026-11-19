import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { guardarPredicciones, obtenerAnalisis } from '../../services/analisis'
import { obtenerConfiguracion } from '../../services/configuracion'
import { traducirErrorDB } from '../../lib/errores'
import { fmtFecha, fmtFechaLarga, fmtNum } from '../../lib/formato'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Paginacion from '../../components/ui/Paginacion'

const PERIODOS = [7, 30, 90]
const POR_PAGINA = 12

function fechaLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const diaMes = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
const etiquetaDia = (iso) => diaMes.format(fechaLocal(iso)).replace('.', '')

function Kpi({ etiqueta, valor, nota, clase = 'text-ink' }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${clase}`}>{valor}</p>
      {nota && <p className="mt-1 text-xs text-slate-500">{nota}</p>}
    </div>
  )
}

function Grafica({ serie }) {
  const max = Math.max(1, ...serie.flatMap((x) => [Number(x.entradas), Number(x.salidas)]))
  const cadaN = Math.ceil(serie.length / 10) // máx. ~10 etiquetas en el eje
  return (
    <div>
      <div className="flex h-44 items-end gap-px sm:gap-0.5" role="img" aria-label="Entradas y salidas por día">
        {serie.map((x) => {
          const e = Number(x.entradas)
          const s = Number(x.salidas)
          return (
            <div key={x.fecha} className="flex h-full flex-1 items-end justify-center gap-px" title={`${etiquetaDia(x.fecha)} · entradas ${fmtNum(e)} · salidas ${fmtNum(s)}`}>
              <div className="w-1/2 max-w-[10px] rounded-t bg-emerald-300" style={{ height: `${Math.max((e / max) * 100, e > 0 ? 3 : 0)}%` }} />
              <div className="w-1/2 max-w-[10px] rounded-t bg-brand-tech" style={{ height: `${Math.max((s / max) * 100, s > 0 ? 3 : 0)}%` }} />
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex gap-px text-[10px] text-slate-400 sm:gap-0.5">
        {serie.map((x, i) => (
          <span key={x.fecha} className="flex-1 overflow-visible whitespace-nowrap text-center">
            {i % cadaN === 0 ? etiquetaDia(x.fecha) : ''}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-300" /> Entradas</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-tech" /> Salidas (consumo)</span>
      </div>
    </div>
  )
}

function DiasBadge({ dias, umbral }) {
  if (dias === null || dias === undefined) return <span className="text-xs text-slate-400">Sin consumo</span>
  const d = Number(dias)
  const clase = d <= 0 ? 'bg-red-50 text-red-700 ring-red-200' : d <= umbral ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ring-1 ${clase}`}>{d <= 0 ? 'Agotado' : `${fmtNum(d)} días`}</span>
}

export default function AnalisisPage() {
  const [cfg, setCfg] = useState(null)
  const [dias, setDias] = useState(null)
  const [d, setD] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [soloRiesgo, setSoloRiesgo] = useState(false)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    obtenerConfiguracion().then((c) => {
      setCfg(c)
      setDias(c.ventana_analisis)
    })
  }, [])

  useEffect(() => {
    if (!dias) return
    let cancelado = false
    setCargando(true)
    setError('')
    obtenerAnalisis(dias)
      .then((r) => !cancelado && setD(r))
      .catch((e) => !cancelado && setError(traducirErrorDB(e)))
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [dias])

  const umbral = cfg?.dias_alerta_reabasto ?? 7
  const cobertura = cfg?.dias_cobertura ?? 15

  const productos = useMemo(() => {
    return (d?.productos ?? []).map((p) => {
      const promedio = Number(p.promedio)
      const stock = Number(p.stock)
      const sugerido = promedio > 0 ? Math.max(0, Math.ceil(promedio * cobertura + Number(p.stock_minimo) - stock)) : 0
      const diasEx = p.dias_existencia === null ? null : Number(p.dias_existencia)
      const agotamiento = diasEx !== null && diasEx > 0 ? new Date(Date.now() + diasEx * 86400000) : null
      const riesgo = promedio > 0 && diasEx <= umbral
      return { ...p, promedio, stock, sugerido, diasEx, agotamiento, riesgo }
    })
  }, [d, cobertura, umbral])

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return productos.filter((p) =>
      (!soloRiesgo || p.riesgo) && (!t || p.nombre.toLowerCase().includes(t) || p.codigo_barras.toLowerCase().includes(t))
    )
  }, [productos, soloRiesgo, busca])

  const serie = d?.serie ?? []
  const consumoTotal = serie.reduce((s, x) => s + Number(x.salidas), 0)
  const enRiesgo = productos.filter((p) => p.riesgo).length
  const sinMov = productos.filter((p) => p.promedio === 0).length
  const top = [...productos].filter((p) => Number(p.consumo) > 0).sort((a, b) => Number(b.consumo) - Number(a.consumo)).slice(0, 5)
  const maxTop = Math.max(1, ...top.map((p) => Number(p.consumo)))
  const pagFilas = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  async function guardar() {
    setGuardando(true)
    setError('')
    try {
      const n = await guardarPredicciones(dias)
      setAviso(n > 0 ? `Se guardó la predicción de ${fmtNum(n)} productos.` : 'No hay productos con consumo en el periodo; no se guardó nada.')
      setD((x) => (n > 0 ? { ...x, ultima_prediccion: new Date().toISOString() } : x))
    } catch (e) {
      setError(traducirErrorDB(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Periodo de análisis">
          {[...new Set([...PERIODOS, cfg?.ventana_analisis].filter(Boolean))].sort((a, b) => a - b).map((p) => (
            <button
              key={p}
              aria-pressed={dias === p}
              onClick={() => { setDias(p); setPagina(1) }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                dias === p ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              Últimos {p} días
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {d?.ultima_prediccion && <span className="text-xs text-slate-500">Última guardada: {fmtFecha(d.ultima_prediccion)}</span>}
          <Button variante="suave" cargando={guardando} disabled={!d} onClick={guardar}>Guardar predicción</Button>
        </div>
      </div>

      {aviso && <Alert tipo="exito">{aviso}</Alert>}
      {error && <Alert tipo="error">{error}</Alert>}

      <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${cargando ? 'opacity-60' : ''}`}>
        <Kpi etiqueta="Consumo del periodo" valor={d ? fmtNum(consumoTotal) : '—'} nota="unidades que salieron" />
        <Kpi etiqueta="Consumo promedio" valor={d ? fmtNum(consumoTotal / (d.dias || 1)) : '—'} nota="unidades por día" />
        <Kpi etiqueta="En riesgo" valor={d ? fmtNum(enRiesgo) : '—'} nota={`se agotan en ≤ ${umbral} días`} clase={enRiesgo > 0 ? 'text-warn' : 'text-ink'} />
        <Kpi etiqueta="Sin movimiento" valor={d ? fmtNum(sinMov) : '—'} nota="productos sin salidas en el periodo" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card titulo="Entradas vs. salidas" subtitulo={d ? `${etiquetaDia(serie[0]?.fecha ?? '2000-01-01')} – ${etiquetaDia(serie.at(-1)?.fecha ?? '2000-01-01')}` : ''} className="lg:col-span-2">
          {serie.length ? <Grafica serie={serie} /> : <p className="py-10 text-center text-sm text-slate-500">{cargando ? 'Cargando…' : 'Sin datos.'}</p>}
        </Card>

        <Card titulo="Más consumidos" subtitulo={`Últimos ${dias ?? '—'} días`}>
          {top.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">{cargando ? 'Cargando…' : 'No hubo salidas en el periodo.'}</p>
          ) : (
            <ol className="space-y-3">
              {top.map((p, i) => (
                <li key={p.id_producto}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-ink"><span className="mr-2 text-xs text-slate-400">{i + 1}</span>{p.nombre}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-ink">{fmtNum(p.consumo)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-tech" style={{ width: `${(Number(p.consumo) / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card
        titulo="Proyección por producto"
        subtitulo={`Sugerido para cubrir ${cobertura} días de consumo más el stock mínimo`}
        accion={
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search" aria-label="Buscar producto" placeholder="Buscar…" value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1) }}
              className="w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30"
            />
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={soloRiesgo} onChange={(e) => { setSoloRiesgo(e.target.checked); setPagina(1) }} className="rounded border-slate-300" />
              Solo en riesgo
            </label>
          </div>
        }
      >
        {pagFilas.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">{cargando ? 'Cargando…' : 'No hay productos para mostrar.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="pb-2 pr-3 font-medium">Producto</th>
                  <th className="pb-2 pr-3 text-right font-medium">Existencia</th>
                  <th className="pb-2 pr-3 text-right font-medium">Consumo</th>
                  <th className="pb-2 pr-3 text-right font-medium">Prom./día</th>
                  <th className="pb-2 pr-3 font-medium">Alcanza para</th>
                  <th className="pb-2 pr-3 font-medium">Se agota aprox.</th>
                  <th className="pb-2 pr-3 text-right font-medium">Sugerido</th>
                  <th className="pb-2 font-medium"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagFilas.map((p) => (
                  <tr key={p.id_producto}>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-ink">{p.nombre}</p>
                      <p className="font-mono text-xs text-slate-500">{p.codigo_barras}</p>
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums">{fmtNum(p.stock)} <span className="text-xs text-slate-500">{p.unidad_medida.toLowerCase()}</span></td>
                    <td className="py-3 pr-3 text-right tabular-nums text-slate-600">{fmtNum(p.consumo)}</td>
                    <td className="py-3 pr-3 text-right tabular-nums text-slate-600">{fmtNum(p.promedio)}</td>
                    <td className="py-3 pr-3"><DiasBadge dias={p.diasEx} umbral={umbral} /></td>
                    <td className="py-3 pr-3 text-slate-600">{p.agotamiento ? fmtFechaLarga(p.agotamiento) : p.diasEx === 0 ? 'Ya agotado' : '—'}</td>
                    <td className={`py-3 pr-3 text-right font-semibold tabular-nums ${p.sugerido > 0 ? 'text-brand-tech' : 'text-slate-400'}`}>{p.sugerido > 0 ? fmtNum(p.sugerido) : '—'}</td>
                    <td className="py-3 text-right">
                      {p.sugerido > 0 && (
                        <Link to={`/entradas?producto=${p.id_producto}`} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand ring-1 ring-brand/30 hover:bg-cyan-50">
                          Reabastecer
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtrados.length > POR_PAGINA && <Paginacion pagina={pagina} porPagina={POR_PAGINA} total={filtrados.length} onCambiar={setPagina} />}
      </Card>

      <p className="text-xs text-slate-500">
        La proyección usa el promedio de salidas del periodo (sin contar ajustes de auditoría). Es una estimación: revisa temporadas o pedidos especiales antes de comprar.
      </p>
    </div>
  )
}
