import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { actualizarProducto, cambiarActivo, crearProducto, listarInventario } from '../../services/productos'
import { traducirErrorDB } from '../../lib/errores'
import { fmtFecha, fmtNum } from '../../lib/formato'
import { useDebounce } from '../../hooks/useDebounce'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Paginacion from '../../components/ui/Paginacion'
import ProductoForm from './ProductoForm'
import { t } from '../../i18n'

const POR_PAGINA = 10
const FILTROS = [
  { valor: 'TODOS', etiqueta: 'comun.todos' },
  { valor: 'DISPONIBLE', etiqueta: 'estado.DISPONIBLE' },
  { valor: 'STOCK_BAJO', etiqueta: 'estado.STOCK_BAJO' },
  { valor: 'AGOTADO', etiqueta: 'estado.AGOTADO' },
]

// modoAdmin = true  -> CRUD completo (/admin/productos)
// modoAdmin = false -> solo consulta (/inventario)
export default function InventarioPage({ modoAdmin = false }) {
  const [params] = useSearchParams()
  const [busqueda, setBusqueda] = useState(params.get('q') ?? '')
  const [estado, setEstado] = useState('TODOS')
  const [pagina, setPagina] = useState(1)
  const [verBajas, setVerBajas] = useState(false)
  const [datos, setDatos] = useState({ filas: [], total: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [modal, setModal] = useState(null) // { tipo: 'form' | 'baja', producto? }
  const [procesando, setProcesando] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const reqId = useRef(0)
  const q = useDebounce(busqueda)

  // El buscador de la barra superior navega a /inventario?q=...
  const qUrl = params.get('q') ?? ''
  useEffect(() => {
    setBusqueda(qUrl)
    setPagina(1)
  }, [qUrl])

  useEffect(() => {
    const id = ++reqId.current
    setCargando(true)
    setError('')
    listarInventario({ busqueda: q, estado, pagina, porPagina: POR_PAGINA, incluirInactivos: modoAdmin && verBajas })
      .then((r) => {
        if (id !== reqId.current) return
        const paginas = Math.max(1, Math.ceil(r.total / POR_PAGINA))
        if (pagina > paginas) return setPagina(paginas)
        setDatos(r)
      })
      .catch((e) => id === reqId.current && setError(traducirErrorDB(e)))
      .finally(() => id === reqId.current && setCargando(false))
  }, [q, estado, pagina, verBajas, modoAdmin, recarga])

  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(id)
  }, [aviso])

  const cerrarModal = useCallback(() => setModal(null), [])
  const recargar = () => setRecarga((n) => n + 1)

  async function guardar(payload, producto) {
    if (producto) {
      await actualizarProducto(producto.id_producto, payload)
      setAviso(t('inv.msgActualizado'))
    } else {
      try {
        await crearProducto(payload)
      } catch (e) {
        if (e.parcial) recargar() // el producto sí quedó creado
        throw e
      }
      setAviso(t('inv.msgRegistrado'))
    }
    setModal(null)
    recargar()
  }

  async function confirmarBaja() {
    const p = modal.producto
    setProcesando(true)
    try {
      await cambiarActivo(p.id_producto, !p.activo)
      setAviso(p.activo ? t('inv.msgBaja') : t('inv.msgReactivado'))
      recargar()
    } catch (e) {
      setError(traducirErrorDB(e))
    } finally {
      setProcesando(false)
      setModal(null)
    }
  }

  const { filas, total } = datos
  const hayFiltros = busqueda || estado !== 'TODOS'

  return (
    <section>
      <div className="flex justify-end">
        {modoAdmin && <Button onClick={() => setModal({ tipo: 'form' })}>{t('inv.nuevo')}</Button>}
      </div>

      <div className="mt-5 space-y-3">
        {aviso && <Alert tipo="exito">{aviso}</Alert>}
        {error && <Alert tipo="error">{error}</Alert>}

        <input
          type="search"
          aria-label={t('layout.buscarProductos')}
          placeholder={t('inv.buscar')}
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30"
        />

        <div className="flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              aria-pressed={estado === f.valor}
              onClick={() => { setEstado(f.valor); setPagina(1) }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                estado === f.valor ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {t(f.etiqueta)}
            </button>
          ))}
          {modoAdmin && (
            <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox" checked={verBajas}
                onChange={(e) => { setVerBajas(e.target.checked); setPagina(1) }}
                className="h-4 w-4 rounded border-slate-300 text-brand-tech focus:ring-brand-tech"
              />
              {t('inv.verBajas')}
            </label>
          )}
        </div>
      </div>

      <div className={`mt-4 transition-opacity ${cargando ? 'opacity-60' : ''}`} aria-busy={cargando}>
        {filas.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            {cargando
              ? t('comun.cargando')
              : hayFiltros
                ? t('inv.sinCoincidencias')
                : modoAdmin
                  ? t('inv.vacioAdmin')
                  : t('inv.vacio')}
          </div>
        ) : (
          <>
            {/* Tabla (escritorio) */}
            <div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('comun.producto')}</th>
                    <th className="px-4 py-3 font-medium">{t('comun.codigo')}</th>
                    <th className="px-4 py-3 font-medium">{t('comun.ubicacion')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('comun.existencia')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('comun.minimo')}</th>
                    <th className="px-4 py-3 font-medium">{t('comun.estado')}</th>
                    {modoAdmin && <th className="px-4 py-3 font-medium">{t('comun.acciones')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filas.map((p) => (
                    <tr key={p.id_producto} className={p.activo ? '' : 'bg-slate-50/60 text-slate-500'}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{p.nombre}</p>
                        {p.descripcion && <p className="max-w-xs truncate text-xs text-slate-500">{p.descripcion}</p>}
                        <p className="text-xs text-slate-400">{t('inv.actualizado', { fecha: fmtFecha(p.fecha_actualizacion) })}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.codigo_barras}</td>
                      <td className="px-4 py-3">{p.ubicacion || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {fmtNum(p.cantidad_actual)}{' '}
                        <span className="text-xs font-normal text-slate-500">{p.unidad_medida.toLowerCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtNum(p.stock_minimo)}</td>
                      <td className="px-4 py-3"><BadgeEstado estado={p.activo ? p.estado : 'BAJA'} /></td>
                      {modoAdmin && (
                        <td className="px-4 py-3">
                          <Acciones p={p} onEditar={(x) => setModal({ tipo: 'form', producto: x })} onBaja={(x) => setModal({ tipo: 'baja', producto: x })} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas (móvil) */}
            <ul className="space-y-3 md:hidden">
              {filas.map((p) => (
                <li key={p.id_producto} className={`rounded-2xl bg-white p-4 ring-1 ring-slate-200 ${p.activo ? '' : 'opacity-70'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{p.nombre}</p>
                      <p className="font-mono text-xs text-slate-500">{p.codigo_barras}</p>
                    </div>
                    <BadgeEstado estado={p.activo ? p.estado : 'BAJA'} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">{t('comun.existencia')}</dt>
                      <dd className="font-semibold tabular-nums">{fmtNum(p.cantidad_actual)} <span className="text-xs font-normal text-slate-500">{p.unidad_medida.toLowerCase()}</span></dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('comun.ubicacion')}</dt>
                      <dd>{p.ubicacion || '—'}</dd>
                    </div>
                  </dl>
                  {modoAdmin && (
                    <div className="mt-3">
                      <Acciones p={p} onEditar={(x) => setModal({ tipo: 'form', producto: x })} onBaja={(x) => setModal({ tipo: 'baja', producto: x })} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {total > 0 && <Paginacion pagina={pagina} porPagina={POR_PAGINA} total={total} onCambiar={setPagina} />}

      {modal?.tipo === 'form' && (
        <Modal titulo={modal.producto ? t('inv.editarProducto') : t('inv.nuevoProducto')} onCerrar={cerrarModal}>
          <ProductoForm producto={modal.producto} onGuardar={(payload) => guardar(payload, modal.producto)} onCancelar={cerrarModal} />
        </Modal>
      )}

      {modal?.tipo === 'baja' && (
        <Modal titulo={modal.producto.activo ? t('inv.darBajaTitulo') : t('inv.reactivarTitulo')} onCerrar={cerrarModal} ancho="max-w-md">
          <p className="text-sm text-slate-600">
            {modal.producto.activo
              ? t('inv.bajaTexto', { nombre: modal.producto.nombre })
              : t('inv.reactivarTexto', { nombre: modal.producto.nombre })}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variante="suave" onClick={cerrarModal}>{t('comun.cancelar')}</Button>
            <Button variante={modal.producto.activo ? 'peligro' : 'exito'} cargando={procesando} onClick={confirmarBaja}>
              {modal.producto.activo ? t('inv.darBaja') : t('inv.reactivar')}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  )
}

function Acciones({ p, onEditar, onBaja }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onEditar(p)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand ring-1 ring-brand/30 hover:bg-cyan-50">
        {t('comun.editar')}
      </button>
      <button
        onClick={() => onBaja(p)}
        className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ${
          p.activo ? 'text-danger ring-red-200 hover:bg-red-50' : 'text-emerald-700 ring-emerald-200 hover:bg-emerald-50'
        }`}
      >
        {p.activo ? t('inv.darBaja') : t('inv.reactivar')}
      </button>
    </div>
  )
}
