import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  cancelarAuditoria, eliminarConteo, finalizarAuditoria, obtenerAuditoria, registrarConteo,
} from '../../services/auditorias'
import { traducirErrorDB } from '../../lib/errores'
import { fmtFecha, fmtNum } from '../../lib/formato'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import BuscadorProducto from '../../components/ui/BuscadorProducto'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'

function Diferencia({ valor }) {
  const v = Number(valor)
  if (v === 0) return <span className="text-slate-500">0</span>
  return (
    <span className={`font-semibold tabular-nums ${v > 0 ? 'text-emerald-600' : 'text-danger'}`}>
      {v > 0 ? '+' : ''}{fmtNum(v)} <span className="text-xs font-normal">{v > 0 ? 'sobrante' : 'faltante'}</span>
    </span>
  )
}

function Dato({ etiqueta, valor, clase = 'text-ink' }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs text-slate-500">{etiqueta}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${clase}`}>{valor}</p>
    </div>
  )
}

export default function AuditoriaDetalle() {
  const { id } = useParams()
  const idNum = Number(id)
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [producto, setProducto] = useState(null)
  const [cantidad, setCantidad] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [modal, setModal] = useState(null) // 'finalizar' | 'cancelar'
  const [ajustar, setAjustar] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [soloDif, setSoloDif] = useState(false)
  const cantRef = useRef(null)

  const cargar = useCallback(() => {
    return obtenerAuditoria(idNum)
      .then(setD)
      .catch((e) => setError(traducirErrorDB(e)))
  }, [idNum])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    if (producto) cantRef.current?.focus()
  }, [producto?.id_producto])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(t)
  }, [aviso])

  if (d && !d.auditoria) {
    return (
      <div className="mx-auto max-w-md rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">No se encontró la auditoría #{id}.</p>
        <Link to="/admin/auditorias" className="mt-4 inline-block text-sm font-semibold text-brand-tech hover:underline">Volver a auditorías</Link>
      </div>
    )
  }

  const a = d?.auditoria
  const detalle = d?.detalle ?? []
  const editable = a?.estado === 'EN_PROCESO'
  const yaContado = producto && detalle.find((x) => x.id_producto === producto.id_producto)
  const visibles = soloDif ? detalle.filter((x) => Number(x.diferencia) !== 0) : detalle

  async function guardarConteo(e) {
    e.preventDefault()
    setError('')
    const c = Number(cantidad)
    if (!producto) return setError('Selecciona un producto.')
    if (cantidad === '' || Number.isNaN(c) || c < 0) return setError('Ingresa la cantidad contada (0 o más).')
    setGuardando(true)
    try {
      const det = await registrarConteo(idNum, producto.id_producto, c)
      const dif = Number(det.diferencia)
      setAviso(`${producto.nombre}: ${dif === 0 ? 'coincide con el sistema' : `diferencia de ${dif > 0 ? '+' : ''}${fmtNum(dif)}`}.`)
      setProducto(null)
      setCantidad('')
      await cargar()
    } catch (err) {
      setError(traducirErrorDB(err))
    } finally {
      setGuardando(false)
    }
  }

  async function quitar(det) {
    setError('')
    try {
      await eliminarConteo(det.id_detalle)
      await cargar()
    } catch (err) {
      setError(traducirErrorDB(err))
    }
  }

  async function cerrar() {
    setProcesando(true)
    setError('')
    try {
      if (modal === 'finalizar') {
        await finalizarAuditoria(idNum, ajustar)
        setAviso(ajustar ? 'Auditoría finalizada y existencias ajustadas.' : 'Auditoría finalizada sin ajustar existencias.')
      } else {
        await cancelarAuditoria(idNum)
        setAviso('Auditoría cancelada.')
      }
      await cargar()
    } catch (err) {
      setError(traducirErrorDB(err))
    } finally {
      setProcesando(false)
      setModal(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/auditorias" className="text-sm font-semibold text-brand-tech hover:underline">‹ Auditorías</Link>
          <span className="font-mono text-sm text-slate-500">#{id}</span>
          {a && <BadgeEstado estado={a.estado} />}
        </div>
        {editable && (
          <div className="flex gap-2">
            <Button variante="suave" onClick={() => setModal('cancelar')}>Cancelar auditoría</Button>
            <Button variante="exito" disabled={detalle.length === 0} onClick={() => { setAjustar(true); setModal('finalizar') }}>Finalizar</Button>
          </div>
        )}
      </div>

      {aviso && <Alert tipo="exito">{aviso}</Alert>}
      {error && <Alert tipo="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Dato etiqueta="Productos revisados" valor={a ? fmtNum(a.productos_revisados) : '—'} />
        <Dato etiqueta="Con diferencias" valor={a ? fmtNum(a.diferencias) : '—'} clase={a?.diferencias > 0 ? 'text-warn' : 'text-ink'} />
        <Dato etiqueta="Unidades sobrantes" valor={a ? `+${fmtNum(a.sobrantes)}` : '—'} clase="text-emerald-600" />
        <Dato etiqueta="Unidades faltantes" valor={a ? `-${fmtNum(a.faltantes)}` : '—'} clase="text-danger" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          {editable && (
            <Card titulo="Registrar conteo" subtitulo="Escanea o busca el producto y escribe lo que contaste">
              <form onSubmit={guardarConteo} className="space-y-4" noValidate>
                {!producto ? (
                  <BuscadorProducto id="buscar-auditoria" onSeleccionar={(p) => { setProducto(p); setError('') }} onError={setError} autoFocus />
                ) : (
                  <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{producto.nombre}</p>
                        <p className="font-mono text-xs text-slate-500">{producto.codigo_barras}</p>
                        {producto.ubicacion && <p className="text-xs text-slate-500">{producto.ubicacion}</p>}
                      </div>
                      <button type="button" onClick={() => { setProducto(null); setCantidad('') }} className="text-xs font-semibold text-brand-tech hover:underline">Cambiar</button>
                    </div>
                    {yaContado && (
                      <p className="mt-2 text-xs text-amber-700">Ya se contó ({fmtNum(yaContado.cantidad_fisica)}). Guardar reemplaza el conteo anterior.</p>
                    )}
                  </div>
                )}
                <Field
                  label={`Cantidad contada${producto ? ` (${producto.unidad_medida.toLowerCase()})` : ''}`}
                  id="cantidad-fisica" type="number" inputMode="decimal" min="0" step="any"
                  inputRef={cantRef} disabled={!producto}
                  value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                />
                <p className="text-xs text-slate-500">La existencia del sistema se toma al guardar; no se muestra para no influir en el conteo.</p>
                <Button type="submit" cargando={guardando} disabled={!producto || cantidad === ''} className="w-full">Guardar conteo</Button>
              </form>
            </Card>
          )}

          <Card titulo="Información">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Responsable</dt><dd className="font-medium text-ink">{a?.responsable ?? '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Inicio</dt><dd className="text-ink">{a ? fmtFecha(a.fecha_auditoria) : '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Cierre</dt><dd className="text-ink">{a?.fecha_cierre ? fmtFecha(a.fecha_cierre) : '—'}</dd></div>
              {a?.estado === 'FINALIZADA' && (
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Ajuste de inventario</dt><dd className="text-ink">{a.ajuste_aplicado ? 'Aplicado' : 'No aplicado'}</dd></div>
              )}
              {a?.observaciones && <div><dt className="text-slate-500">Observaciones</dt><dd className="mt-0.5 text-ink">{a.observaciones}</dd></div>}
            </dl>
          </Card>
        </div>

        <Card
          titulo="Conteos registrados"
          className="lg:col-span-3"
          accion={
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={soloDif} onChange={(e) => setSoloDif(e.target.checked)} className="rounded border-slate-300" />
              Solo diferencias
            </label>
          }
        >
          {visibles.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {!d ? 'Cargando…' : soloDif ? 'No hay diferencias.' : 'Aún no hay productos contados.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500">
                    <th className="pb-2 pr-3 font-medium">Producto</th>
                    <th className="pb-2 pr-3 text-right font-medium">Sistema</th>
                    <th className="pb-2 pr-3 text-right font-medium">Físico</th>
                    <th className="pb-2 pr-3 text-right font-medium">Diferencia</th>
                    {editable && <th className="pb-2 font-medium"><span className="sr-only">Acciones</span></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibles.map((x) => (
                    <tr key={x.id_detalle}>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-ink">{x.producto?.nombre}</p>
                        <p className="font-mono text-xs text-slate-500">{x.producto?.codigo_barras}</p>
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums text-slate-600">{fmtNum(x.cantidad_sistema)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-ink">{fmtNum(x.cantidad_fisica)}</td>
                      <td className="py-3 pr-3 text-right"><Diferencia valor={x.diferencia} /></td>
                      {editable && (
                        <td className="py-3 text-right">
                          <button onClick={() => quitar(x)} className="rounded-md px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50" aria-label={`Quitar conteo de ${x.producto?.nombre}`}>
                            Quitar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {modal === 'finalizar' && (
        <Modal titulo="Finalizar auditoría" onCerrar={() => setModal(null)} ancho="max-w-md">
          <p className="text-sm text-slate-600">
            Se revisaron {fmtNum(a.productos_revisados)} productos; {fmtNum(a.diferencias)} tienen diferencias. Después de finalizar ya no podrás modificar los conteos.
          </p>
          <label className="mt-4 flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
            <input type="checkbox" checked={ajustar} onChange={(e) => setAjustar(e.target.checked)} className="mt-0.5 rounded border-slate-300" />
            <span>
              <span className="block font-semibold text-ink">Ajustar existencias al conteo físico</span>
              <span className="block text-xs text-slate-500">Cada diferencia se registra como entrada o salida «Ajuste por auditoría #{id}».</span>
            </span>
          </label>
          <div className="mt-6 flex justify-end gap-3">
            <Button variante="suave" onClick={() => setModal(null)}>Volver</Button>
            <Button variante="exito" cargando={procesando} onClick={cerrar}>Finalizar</Button>
          </div>
        </Modal>
      )}

      {modal === 'cancelar' && (
        <Modal titulo="Cancelar auditoría" onCerrar={() => setModal(null)} ancho="max-w-md">
          <p className="text-sm text-slate-600">Los conteos se conservan como referencia, pero no se aplicará ningún ajuste al inventario. Esta acción no se puede deshacer.</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variante="suave" onClick={() => setModal(null)}>Volver</Button>
            <Button variante="peligro" cargando={procesando} onClick={cerrar}>Cancelar auditoría</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
