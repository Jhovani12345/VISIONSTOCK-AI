import { useState } from 'react'
import { reporteAuditorias, reporteInventario, reporteMovimientos } from '../../services/reportes'
import { descargarCSV, hoyISO } from '../../lib/csv'
import { traducirErrorDB } from '../../lib/errores'
import { fmtFecha, fmtNum } from '../../lib/formato'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'

const CONTROL =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30'

const ESTADO_STOCK = { DISPONIBLE: 'Disponible', STOCK_BAJO: 'Stock bajo', AGOTADO: 'Agotado' }
const ESTADO_AUD = { EN_PROCESO: 'En proceso', FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada' }
const persona = (p) => (p ? `${p.nombre} ${p.apellido}`.trim() : '')

function hace(dias) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Etiqueta({ htmlFor, children }) {
  return <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-600">{children}</label>
}

function Rango({ prefijo, desde, hasta, onDesde, onHasta }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Etiqueta htmlFor={`${prefijo}-desde`}>Desde</Etiqueta>
        <input id={`${prefijo}-desde`} type="date" value={desde} max={hasta || undefined} onChange={(e) => onDesde(e.target.value)} className={CONTROL} />
      </div>
      <div>
        <Etiqueta htmlFor={`${prefijo}-hasta`}>Hasta</Etiqueta>
        <input id={`${prefijo}-hasta`} type="date" value={hasta} min={desde || undefined} onChange={(e) => onHasta(e.target.value)} className={CONTROL} />
      </div>
    </div>
  )
}

function useExportar() {
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null) // { tipo, texto }
  async function ejecutar(fn) {
    setCargando(true)
    setResultado(null)
    try {
      const n = await fn()
      setResultado(n > 0 ? { tipo: 'exito', texto: `Se descargaron ${fmtNum(n)} registros.` } : { tipo: 'info', texto: 'No hay registros con esos filtros.' })
    } catch (e) {
      setResultado({ tipo: 'error', texto: traducirErrorDB(e) })
    } finally {
      setCargando(false)
    }
  }
  return { cargando, resultado, ejecutar }
}

function TarjetaReporte({ icono, titulo, descripcion, exp, onDescargar, children }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-brand-tech">
          <Icon name={icono} className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">{titulo}</h2>
          <p className="text-xs text-slate-500">{descripcion}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
      {exp.resultado && <div className="mt-4"><Alert tipo={exp.resultado.tipo}>{exp.resultado.texto}</Alert></div>}
      <Button className="mt-4 w-full" cargando={exp.cargando} onClick={onDescargar}>Descargar CSV</Button>
    </Card>
  )
}

export default function ReportesPage() {
  // Inventario
  const [invEstado, setInvEstado] = useState('TODOS')
  const [invBajas, setInvBajas] = useState(false)
  const expInv = useExportar()

  // Movimientos
  const [movDesde, setMovDesde] = useState(hace(30))
  const [movHasta, setMovHasta] = useState(hoyISO())
  const [movTipo, setMovTipo] = useState('TODOS')
  const expMov = useExportar()

  // Auditorías
  const [audDesde, setAudDesde] = useState(hace(90))
  const [audHasta, setAudHasta] = useState(hoyISO())
  const [audEstado, setAudEstado] = useState('FINALIZADA')
  const expAud = useExportar()

  const inventario = () =>
    expInv.ejecutar(async () => {
      const filas = await reporteInventario({ estado: invEstado, incluirBajas: invBajas })
      if (filas.length) {
        descargarCSV(`inventario_${hoyISO()}.csv`, filas, [
          { titulo: 'Código', valor: (f) => f.codigo_barras },
          { titulo: 'Producto', valor: (f) => f.nombre },
          { titulo: 'Descripción', valor: (f) => f.descripcion },
          { titulo: 'Unidad', valor: (f) => f.unidad_medida },
          { titulo: 'Ubicación', valor: (f) => f.ubicacion },
          { titulo: 'Stock mínimo', valor: (f) => f.stock_minimo },
          { titulo: 'Existencia', valor: (f) => f.cantidad_actual },
          { titulo: 'Estado', valor: (f) => ESTADO_STOCK[f.estado] ?? f.estado },
          { titulo: 'Activo', valor: (f) => (f.activo ? 'Sí' : 'No') },
          { titulo: 'Última actualización', valor: (f) => fmtFecha(f.fecha_actualizacion) },
        ])
      }
      return filas.length
    })

  const movimientos = () =>
    expMov.ejecutar(async () => {
      const filas = await reporteMovimientos({ desde: movDesde, hasta: movHasta, tipo: movTipo })
      if (filas.length) {
        descargarCSV(`movimientos_${movDesde || 'inicio'}_${movHasta || hoyISO()}.csv`, filas, [
          { titulo: 'Folio', valor: (f) => f.id_movimiento },
          { titulo: 'Fecha', valor: (f) => fmtFecha(f.fecha_movimiento) },
          { titulo: 'Tipo', valor: (f) => (f.tipo_movimiento === 'ENTRADA' ? 'Entrada' : 'Salida') },
          { titulo: 'Código', valor: (f) => f.producto?.codigo_barras },
          { titulo: 'Producto', valor: (f) => f.producto?.nombre },
          { titulo: 'Cantidad', valor: (f) => f.cantidad },
          { titulo: 'Unidad', valor: (f) => f.producto?.unidad_medida },
          { titulo: 'Usuario', valor: (f) => persona(f.perfil) },
          { titulo: 'Observaciones', valor: (f) => f.observaciones },
        ])
      }
      return filas.length
    })

  const auditorias = () =>
    expAud.ejecutar(async () => {
      const filas = await reporteAuditorias({ desde: audDesde, hasta: audHasta, estado: audEstado })
      if (filas.length) {
        descargarCSV(`auditorias_${audDesde || 'inicio'}_${audHasta || hoyISO()}.csv`, filas, [
          { titulo: 'Auditoría', valor: (f) => f.auditoria?.id_auditoria },
          { titulo: 'Fecha', valor: (f) => fmtFecha(f.auditoria?.fecha_auditoria) },
          { titulo: 'Estado', valor: (f) => ESTADO_AUD[f.auditoria?.estado] ?? f.auditoria?.estado },
          { titulo: 'Responsable', valor: (f) => persona(f.auditoria?.perfil) },
          { titulo: 'Código', valor: (f) => f.producto?.codigo_barras },
          { titulo: 'Producto', valor: (f) => f.producto?.nombre },
          { titulo: 'Unidad', valor: (f) => f.producto?.unidad_medida },
          { titulo: 'Cantidad sistema', valor: (f) => f.cantidad_sistema },
          { titulo: 'Cantidad física', valor: (f) => f.cantidad_fisica },
          { titulo: 'Diferencia', valor: (f) => f.diferencia },
          { titulo: 'Método', valor: (f) => (f.metodo_conteo === 'IA' ? 'IA' : 'Manual') },
        ])
      }
      return filas.length
    })

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <TarjetaReporte icono="inventario" titulo="Inventario actual" descripcion="Existencias, mínimos y estado de cada producto" exp={expInv} onDescargar={inventario}>
          <div>
            <Etiqueta htmlFor="inv-estado">Estado</Etiqueta>
            <select id="inv-estado" value={invEstado} onChange={(e) => setInvEstado(e.target.value)} className={CONTROL}>
              <option value="TODOS">Todos</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="STOCK_BAJO">Stock bajo</option>
              <option value="AGOTADO">Agotado</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={invBajas} onChange={(e) => setInvBajas(e.target.checked)} className="rounded border-slate-300" />
            Incluir productos dados de baja
          </label>
        </TarjetaReporte>

        <TarjetaReporte icono="entradas" titulo="Movimientos" descripcion="Entradas y salidas con usuario y observaciones" exp={expMov} onDescargar={movimientos}>
          <Rango prefijo="mov" desde={movDesde} hasta={movHasta} onDesde={setMovDesde} onHasta={setMovHasta} />
          <div>
            <Etiqueta htmlFor="mov-tipo">Tipo</Etiqueta>
            <select id="mov-tipo" value={movTipo} onChange={(e) => setMovTipo(e.target.value)} className={CONTROL}>
              <option value="TODOS">Entradas y salidas</option>
              <option value="ENTRADA">Solo entradas</option>
              <option value="SALIDA">Solo salidas</option>
            </select>
          </div>
        </TarjetaReporte>

        <TarjetaReporte icono="auditorias" titulo="Auditorías" descripcion="Conteos por producto: sistema, físico y diferencia" exp={expAud} onDescargar={auditorias}>
          <Rango prefijo="aud" desde={audDesde} hasta={audHasta} onDesde={setAudDesde} onHasta={setAudHasta} />
          <div>
            <Etiqueta htmlFor="aud-estado">Estado</Etiqueta>
            <select id="aud-estado" value={audEstado} onChange={(e) => setAudEstado(e.target.value)} className={CONTROL}>
              <option value="FINALIZADA">Finalizadas</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="TODOS">Todas</option>
            </select>
          </div>
        </TarjetaReporte>
      </div>

      <p className="text-xs text-slate-500">
        Los archivos CSV se abren directamente en Excel o Google Sheets. Las fechas se exportan en tu zona horaria local.
      </p>
    </div>
  )
}
