import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { iniciarAuditoria, listarAuditorias } from '../../services/auditorias'
import { traducirErrorDB } from '../../lib/errores'
import { fmtFechaLarga, fmtNum } from '../../lib/formato'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import Paginacion from '../../components/ui/Paginacion'

const POR_PAGINA = 10
const FILTROS = [
  { valor: 'TODOS', etiqueta: 'Todas' },
  { valor: 'EN_PROCESO', etiqueta: 'En proceso' },
  { valor: 'FINALIZADA', etiqueta: 'Finalizadas' },
  { valor: 'CANCELADA', etiqueta: 'Canceladas' },
]

export default function AuditoriasPage() {
  const navigate = useNavigate()
  const [estado, setEstado] = useState('TODOS')
  const [pagina, setPagina] = useState(1)
  const [datos, setDatos] = useState({ filas: [], total: 0 })
  const [enProceso, setEnProceso] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [obs, setObs] = useState('')
  const [creando, setCreando] = useState(false)
  const [errorModal, setErrorModal] = useState('')

  useEffect(() => {
    listarAuditorias({ estado: 'EN_PROCESO', porPagina: 1 })
      .then((r) => setEnProceso(r.filas[0] ?? null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setError('')
    listarAuditorias({ estado, pagina, porPagina: POR_PAGINA })
      .then((r) => {
        if (cancelado) return
        const paginas = Math.max(1, Math.ceil(r.total / POR_PAGINA))
        if (pagina > paginas) return setPagina(paginas)
        setDatos(r)
      })
      .catch((e) => !cancelado && setError(traducirErrorDB(e)))
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [estado, pagina])

  async function crear(e) {
    e.preventDefault()
    setCreando(true)
    setErrorModal('')
    try {
      const a = await iniciarAuditoria(obs.trim())
      navigate(`/admin/auditorias/${a.id_auditoria}`)
    } catch (err) {
      setErrorModal(traducirErrorDB(err))
      setCreando(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              aria-pressed={estado === f.valor}
              onClick={() => { setEstado(f.valor); setPagina(1) }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                estado === f.valor ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
        {enProceso ? (
          <Link to={`/admin/auditorias/${enProceso.id_auditoria}`} className="rounded-lg bg-brand-tech px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
            Continuar auditoría #{enProceso.id_auditoria}
          </Link>
        ) : (
          <Button onClick={() => { setObs(''); setErrorModal(''); setModal(true) }}>+ Nueva auditoría</Button>
        )}
      </div>

      {error && <Alert tipo="error">{error}</Alert>}

      <div className={`overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity ${cargando ? 'opacity-60' : ''}`} aria-busy={cargando}>
        {datos.filas.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {cargando ? 'Cargando…' : estado === 'TODOS' ? 'Aún no hay auditorías. Inicia una para comparar el sistema con el conteo físico.' : 'No hay auditorías con este estado.'}
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Folio</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 text-right font-medium">Revisados</th>
                <th className="px-4 py-3 text-right font-medium">Diferencias</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datos.filas.map((a) => (
                <tr key={a.id_auditoria}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">#{a.id_auditoria}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtFechaLarga(a.fecha_auditoria)}</td>
                  <td className="px-4 py-3 text-ink">{a.responsable}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtNum(a.productos_revisados)}</td>
                  <td className={`px-4 py-3 text-right font-semibold tabular-nums ${a.diferencias > 0 ? 'text-warn' : 'text-slate-600'}`}>{fmtNum(a.diferencias)}</td>
                  <td className="px-4 py-3"><BadgeEstado estado={a.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/auditorias/${a.id_auditoria}`} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand ring-1 ring-brand/30 hover:bg-cyan-50">
                      {a.estado === 'EN_PROCESO' ? 'Continuar' : 'Ver detalle'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {datos.total > 0 && <Paginacion pagina={pagina} porPagina={POR_PAGINA} total={datos.total} onCambiar={setPagina} />}

      {modal && (
        <Modal titulo="Nueva auditoría" onCerrar={() => setModal(false)} ancho="max-w-md">
          <form onSubmit={crear} className="space-y-4">
            {errorModal && <Alert tipo="error">{errorModal}</Alert>}
            <p className="text-sm text-slate-600">
              Cuenta físicamente los productos y regístralos uno por uno. Al finalizar podrás aplicar las diferencias al inventario.
            </p>
            <Field label="Observaciones (opcional)" id="obs-auditoria" maxLength={250} placeholder="Ej. Conteo mensual pasillos 1 a 4" value={obs} onChange={(e) => setObs(e.target.value)} />
            <div className="flex justify-end gap-3">
              <Button type="button" variante="suave" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" cargando={creando}>Iniciar auditoría</Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  )
}
