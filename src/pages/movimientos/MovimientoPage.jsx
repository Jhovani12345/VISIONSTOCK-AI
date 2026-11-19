import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buscarPorCodigo, buscarProductosActivos, obtenerProducto } from '../../services/productos'
import { listarMovimientos, registrarMovimiento } from '../../services/movimientos'
import { traducirErrorDB } from '../../lib/errores'
import { fmtNum } from '../../lib/formato'
import { useDebounce } from '../../hooks/useDebounce'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Field from '../../components/ui/Field'
import Icon from '../../components/ui/Icon'
import TablaMovimientos from './TablaMovimientos'

const CFG = {
  ENTRADA: { titulo: 'Registrar entrada', sub: 'Mercancía que ingresa al almacén', boton: 'Registrar entrada', exito: 'Entrada registrada', historial: 'Últimas entradas', vacio: 'Aún no hay entradas registradas.' },
  SALIDA: { titulo: 'Registrar salida', sub: 'Mercancía que sale del almacén', boton: 'Registrar salida', exito: 'Salida registrada', historial: 'Últimas salidas', vacio: 'Aún no hay salidas registradas.' },
}

// Usar con key={tipo} en la ruta para que el estado no se comparta entre Entradas y Salidas.
export default function MovimientoPage({ tipo }) {
  const cfg = CFG[tipo]
  const esSalida = tipo === 'SALIDA'

  const [texto, setTexto] = useState('')
  const q = useDebounce(texto, 250)
  const [resultados, setResultados] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [producto, setProducto] = useState(null)
  const [cantidad, setCantidad] = useState('')
  const [obs, setObs] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [cargandoH, setCargandoH] = useState(true)
  const [recarga, setRecarga] = useState(0)
  const cantRef = useRef(null)

  // Búsqueda de productos mientras se escribe
  useEffect(() => {
    if (producto) return
    if (!q.trim()) { setResultados([]); return }
    let cancelado = false
    buscarProductosActivos(q)
      .then((r) => !cancelado && setResultados(r))
      .catch(() => !cancelado && setResultados([]))
    return () => { cancelado = true }
  }, [q, producto])

  // Historial del tipo de movimiento
  useEffect(() => {
    let cancelado = false
    setCargandoH(true)
    listarMovimientos({ tipo, porPagina: 8 })
      .then((r) => !cancelado && setHistorial(r.filas))
      .catch(() => !cancelado && setHistorial([]))
      .finally(() => !cancelado && setCargandoH(false))
    return () => { cancelado = true }
  }, [tipo, recarga])

  useEffect(() => {
    if (producto) cantRef.current?.focus()
  }, [producto?.id_producto])

  function seleccionar(p) {
    setProducto(p)
    setTexto('')
    setResultados([])
    setAbierto(false)
    setError('')
  }

  // Lector de códigos de barras (USB) o código tecleado + Enter
  async function onEnter(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const t = texto.trim()
    if (!t) return
    try {
      const exacto = await buscarPorCodigo(t)
      if (exacto) return seleccionar(exacto)
      if (resultados.length === 1) return seleccionar(resultados[0])
      if (resultados.length === 0) setError('No se encontró un producto con ese código.')
    } catch (err) {
      setError(traducirErrorDB(err))
    }
  }

  const cant = Number(cantidad)
  const cantValida = cantidad !== '' && !Number.isNaN(cant) && cant > 0
  const stock = producto ? Number(producto.cantidad_actual) : 0
  const despues = producto && cantValida ? (esSalida ? stock - cant : stock + cant) : null

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setAviso('')
    if (!producto) return setError('Selecciona un producto.')
    if (!cantValida) return setError('Ingresa una cantidad mayor a cero.')
    if (esSalida && cant > stock) return setError(`No hay suficiente existencia (disponible: ${fmtNum(stock)}).`)

    setEnviando(true)
    try {
      await registrarMovimiento({ id_producto: producto.id_producto, tipo, cantidad: cant, observaciones: obs.trim() })
      const actualizado = await obtenerProducto(producto.id_producto)
      setAviso(`${cfg.exito}: ${esSalida ? '-' : '+'}${fmtNum(cant)} ${producto.unidad_medida.toLowerCase()} de ${producto.nombre}.`)
      setProducto(actualizado)
      setCantidad('')
      setObs('')
      setRecarga((n) => n + 1)
    } catch (err) {
      setError(traducirErrorDB(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card titulo={cfg.titulo} subtitulo={cfg.sub} className="lg:col-span-2">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {aviso && <Alert tipo="exito">{aviso}</Alert>}
          {error && <Alert tipo="error">{error}</Alert>}

          {!producto ? (
            <div className="relative">
              <label htmlFor="buscar-producto" className="mb-1 block text-sm font-medium text-slate-700">Producto</label>
              <div className="relative">
                <Icon name="buscar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="buscar-producto"
                  value={texto}
                  autoComplete="off"
                  placeholder="Buscar por nombre o escanear código"
                  onChange={(e) => { setTexto(e.target.value); setAbierto(true); setError('') }}
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
          ) : (
            <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{producto.nombre}</p>
                  <p className="font-mono text-xs text-slate-500">{producto.codigo_barras}</p>
                  {producto.ubicacion && <p className="text-xs text-slate-500">{producto.ubicacion}</p>}
                </div>
                <button type="button" onClick={() => { setProducto(null); setAviso('') }} className="text-xs font-semibold text-brand-tech hover:underline">
                  Cambiar
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Existencia actual: <span className="font-bold text-ink tabular-nums">{fmtNum(stock)}</span>{' '}
                  <span className="text-xs">{producto.unidad_medida.toLowerCase()}</span>
                </p>
                <BadgeEstado estado={producto.estado} />
              </div>
            </div>
          )}

          <Field
            label={`Cantidad${producto ? ` (${producto.unidad_medida.toLowerCase()})` : ''}`}
            id="cantidad" type="number" inputMode="decimal" min="0" step="any"
            inputRef={cantRef} disabled={!producto}
            value={cantidad} onChange={(e) => setCantidad(e.target.value)}
          />
          {despues !== null && (
            <p className={`text-xs ${despues < 0 ? 'font-semibold text-danger' : 'text-slate-500'}`}>
              Existencia después del movimiento: <span className="font-semibold tabular-nums">{fmtNum(despues)}</span>
              {despues < 0 && ' (excede la existencia disponible)'}
            </p>
          )}

          <Field
            label="Observaciones (opcional)" id="observaciones" maxLength={250} disabled={!producto}
            placeholder={esSalida ? 'Ej. Pedido #123' : 'Ej. Factura del proveedor'}
            value={obs} onChange={(e) => setObs(e.target.value)}
          />

          <Button type="submit" cargando={enviando} disabled={!producto || !cantValida} className="w-full">
            {cfg.boton}
          </Button>
        </form>
      </Card>

      <Card
        titulo={cfg.historial}
        className="lg:col-span-3"
        accion={<Link to={`/movimientos?tipo=${tipo}`} className="text-xs font-semibold text-brand-tech hover:underline">Ver todos ›</Link>}
      >
        <div className={cargandoH ? 'opacity-60' : ''} aria-busy={cargandoH}>
          <TablaMovimientos filas={historial} vacio={cargandoH ? 'Cargando…' : cfg.vacio} />
        </div>
      </Card>
    </div>
  )
}
