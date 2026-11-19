import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { atenderAlerta, contarAlertasActivas, listarAlertas } from '../../services/alertas'
import { traducirErrorDB } from '../../lib/errores'
import { fmtFecha, fmtNum } from '../../lib/formato'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import Icon from '../../components/ui/Icon'
import Paginacion from '../../components/ui/Paginacion'

const POR_PAGINA = 10
const SELECT_CLASE =
  'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30'

// PostgREST devuelve la relación 1:1 como objeto (o arreglo en versiones antiguas)
const existencia = (p) => {
  const inv = Array.isArray(p?.inventario) ? p.inventario[0] : p?.inventario
  return Number(inv?.cantidad_actual ?? 0)
}

function Resumen({ etiqueta, valor, icono, tono, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={activo}
      className={`flex items-center gap-4 rounded-xl bg-white p-5 text-left shadow-sm ring-1 transition ${activo ? 'ring-2 ring-brand-tech' : 'ring-slate-200 hover:ring-slate-300'}`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tono}`}>
        <Icon name={icono} className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-2xl font-bold tabular-nums text-ink">{valor}</span>
        <span className="block text-xs text-slate-500">{etiqueta}</span>
      </span>
    </button>
  )
}

export default function AlertasPage() {
  const [estado, setEstado] = useState('ACTIVA')
  const [tipo, setTipo] = useState('TODOS')
  const [pagina, setPagina] = useState(1)
  const [datos, setDatos] = useState({ filas: [], total: 0 })
  const [conteo, setConteo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [procesando, setProcesando] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    contarAlertasActivas().then(setConteo).catch(() => {})
  }, [recarga])

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setError('')
    listarAlertas({ estado, tipo, pagina, porPagina: POR_PAGINA })
      .then((r) => {
        if (cancelado) return
        const paginas = Math.max(1, Math.ceil(r.total / POR_PAGINA))
        if (pagina > paginas) return setPagina(paginas)
        setDatos(r)
      })
      .catch((e) => !cancelado && setError(traducirErrorDB(e)))
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [estado, tipo, pagina, recarga])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(t)
  }, [aviso])

  async function atender(a) {
    setProcesando(a.id_alerta)
    setError('')
    try {
      await atenderAlerta(a.id_alerta)
      setAviso(`Alerta de ${a.producto.nombre} marcada como atendida.`)
      setRecarga((n) => n + 1)
    } catch (e) {
      setError(traducirErrorDB(e))
    } finally {
      setProcesando(null)
    }
  }

  const filtrarTipo = (t) => { setEstado('ACTIVA'); setTipo((x) => (x === t ? 'TODOS' : t)); setPagina(1) }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Resumen etiqueta="Alertas activas" valor={conteo ? fmtNum(conteo.agotado + conteo.stock_bajo) : '—'} icono="alertas" tono="bg-sky-50 text-brand-tech"
          activo={estado === 'ACTIVA' && tipo === 'TODOS'} onClick={() => { setEstado('ACTIVA'); setTipo('TODOS'); setPagina(1) }} />
        <Resumen etiqueta="Productos agotados" valor={conteo ? fmtNum(conteo.agotado) : '—'} icono="agotado" tono="bg-red-50 text-danger"
          activo={estado === 'ACTIVA' && tipo === 'AGOTADO'} onClick={() => filtrarTipo('AGOTADO')} />
        <Resumen etiqueta="Con stock bajo" valor={conteo ? fmtNum(conteo.stock_bajo) : '—'} icono="advertencia" tono="bg-amber-50 text-warn"
          activo={estado === 'ACTIVA' && tipo === 'STOCK_BAJO'} onClick={() => filtrarTipo('STOCK_BAJO')} />
      </div>

      <div className="flex flex-wrap gap-3">
        <select aria-label="Filtrar por estado" value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1) }} className={SELECT_CLASE}>
          <option value="ACTIVA">Activas</option>
          <option value="ATENDIDA">Atendidas</option>
          <option value="CANCELADA">Canceladas</option>
          <option value="TODOS">Todas</option>
        </select>
        <select aria-label="Filtrar por tipo" value={tipo} onChange={(e) => { setTipo(e.target.value); setPagina(1) }} className={SELECT_CLASE}>
          <option value="TODOS">Todos los tipos</option>
          <option value="AGOTADO">Agotado</option>
          <option value="STOCK_BAJO">Stock bajo</option>
        </select>
      </div>

      {aviso && <Alert tipo="exito">{aviso}</Alert>}
      {error && <Alert tipo="error">{error}</Alert>}

      <div className={`overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity ${cargando ? 'opacity-60' : ''}`} aria-busy={cargando}>
        {datos.filas.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {cargando ? 'Cargando…' : estado === 'ACTIVA' ? 'Sin alertas activas: todo el inventario está en niveles normales.' : 'No hay alertas con estos filtros.'}
          </p>
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 text-right font-medium">Existencia / mín.</th>
                <th className="px-4 py-3 font-medium">Generada</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datos.filas.map((a) => {
                const p = a.producto
                const stock = existencia(p)
                return (
                  <tr key={a.id_alerta}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{p.nombre}</p>
                      <p className="font-mono text-xs text-slate-500">{p.codigo_barras}{p.ubicacion ? ` · ${p.ubicacion}` : ''}</p>
                    </td>
                    <td className="px-4 py-3"><BadgeEstado estado={a.tipo_alerta} /></td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="font-semibold text-ink">{fmtNum(stock)}</span>
                      <span className="text-slate-500"> / {fmtNum(p.stock_minimo)} {p.unidad_medida.toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtFecha(a.fecha_alerta)}</td>
                    <td className="px-4 py-3"><BadgeEstado estado={a.estado} /></td>
                    <td className="px-4 py-3">
                      {a.estado === 'ACTIVA' && (
                        <div className="flex justify-end gap-2">
                          {p.activo && (
                            <Link to={`/entradas?producto=${p.id_producto}`} className="rounded-md bg-brand-ia px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110">
                              Reabastecer
                            </Link>
                          )}
                          <button
                            onClick={() => atender(a)}
                            disabled={procesando === a.id_alerta}
                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand ring-1 ring-brand/30 hover:bg-cyan-50 disabled:opacity-50"
                          >
                            Marcar atendida
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {datos.total > 0 && <Paginacion pagina={pagina} porPagina={POR_PAGINA} total={datos.total} onCambiar={setPagina} />}

      <p className="text-xs text-slate-500">
        Las alertas se generan y se cierran solas cuando cambia la existencia. «Marcar atendida» sirve para indicar que ya se gestionó (p. ej. pedido al proveedor).
      </p>
    </section>
  )
}
