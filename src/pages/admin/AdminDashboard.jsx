import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerDashboard } from '../../services/dashboard'
import { traducirErrorDB } from '../../lib/errores'
import { fmtDiaSemana, fmtFechaLarga, fmtNum } from '../../lib/formato'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import TablaMovimientos from '../movimientos/TablaMovimientos'
import { t } from '../../i18n'

const TONOS = {
  azul: 'bg-sky-50 text-brand-tech',
  verde: 'bg-emerald-50 text-brand-ia',
  ambar: 'bg-amber-50 text-warn',
  rojo: 'bg-red-50 text-danger',
}

function Kpi({ etiqueta, valor, nota, notaClase, icono, tono }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{etiqueta}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONOS[tono]}`}>
          <Icon name={icono} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-1 text-3xl font-bold tabular-nums text-ink">{valor}</p>
      <p className={`mt-1 text-xs ${notaClase}`}>{nota}</p>
    </div>
  )
}

function ItemAlerta({ p }) {
  const agotado = p.estado === 'AGOTADO'
  const min = Number(p.stock_minimo)
  const pct = min > 0 ? Math.min(100, Math.max(0, (Number(p.cantidad_actual) / min) * 100)) : 0
  return (
    <li className="rounded-lg bg-slate-50 p-3">
      <p className="text-sm font-semibold text-ink">{p.nombre}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${agotado ? 'bg-danger' : 'bg-warn'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{fmtNum(p.cantidad_actual)} / {fmtNum(min)} {t('dash.min')}</span>
        <BadgeEstado estado={p.estado} />
      </div>
    </li>
  )
}

function diaCorto(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number)
  return fmtDiaSemana(new Date(y, m - 1, d))
}

export default function AdminDashboard() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    obtenerDashboard()
      .then((r) => !cancelado && setD(r))
      .catch((e) => !cancelado && setError(traducirErrorDB(e)))
    return () => { cancelado = true }
  }, [])

  const k = d?.kpis
  const v = (n) => (k ? fmtNum(n) : '—')
  const consumo = d?.consumo ?? []
  const totalConsumo = consumo.reduce((s, x) => s + Number(x.consumo), 0)
  const promedio = totalConsumo / 7
  const dias = k && promedio > 0 ? Number(k.unidades_totales) / promedio : null
  const maxBarra = Math.max(...consumo.map((x) => Number(x.consumo)), 1)
  const aud = d?.ultima_auditoria
  const totalAlertas = k ? Number(k.stock_bajo) + Number(k.agotados) : 0

  return (
    <div className="space-y-5">
      {error && <Alert tipo="error">{error}</Alert>}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi etiqueta={t('dash.productos')} valor={v(k?.total_productos)} nota={t('dash.productosActivos')} notaClase="text-brand-ia" icono="productos" tono="azul" />
        <Kpi etiqueta={t('dash.stockDisponible')} valor={v(k?.unidades_totales)} nota={t('dash.unidadesTotales')} notaClase="text-slate-500" icono="inventario" tono="verde" />
        <Kpi etiqueta={t('dash.stockBajo')} valor={v(k?.stock_bajo)} nota={t('dash.porReponer')} notaClase="text-warn" icono="advertencia" tono="ambar" />
        <Kpi etiqueta={t('dash.agotados')} valor={v(k?.agotados)} nota={t('dash.requierenAccion')} notaClase="text-danger" icono="agotado" tono="rojo" />
      </div>

      {/* Movimientos + Alertas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card
          titulo={t('dash.movRecientes')}
          className="lg:col-span-2"
          accion={<Link to="/movimientos" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-tech hover:underline">{t('comun.verTodos')} <Icon name="chevron" className="h-3 w-3" /></Link>}
        >
          <TablaMovimientos filas={d?.movimientos ?? []} vacio={d ? t('dash.sinMov') : t('comun.cargando')} />
        </Card>

        <Card
          titulo={t('dash.alertasStock')}
          accion={
            totalAlertas > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-white" aria-label={t('dash.nAlertas', { n: totalAlertas })}>
                {totalAlertas}
              </span>
            )
          }
        >
          {d && d.alertas.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">{t('dash.sinAlertas')}</p>
          ) : (
            <ul className="space-y-3">
              {(d?.alertas ?? []).slice(0, 4).map((p) => <ItemAlerta key={p.id_producto} p={p} />)}
              {!d && <li className="py-6 text-center text-sm text-slate-500">{t('comun.cargando')}</li>}
            </ul>
          )}
        </Card>
      </div>

      {/* Consumo + Auditoría */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card titulo={t('dash.consumo')} subtitulo={t('dash.ultimos7')}>
          <div className="flex h-28 items-end gap-2" role="img" aria-label={t('dash.graficaConsumo')}>
            {consumo.map((x, i) => {
              const val = Number(x.consumo)
              return (
                <div key={x.fecha} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${diaCorto(x.fecha)}: ${fmtNum(val)}`}>
                  <span className="text-[10px] tabular-nums text-slate-400">{val > 0 ? fmtNum(val) : ''}</span>
                  <div
                    className={`w-full rounded-t ${i === consumo.length - 1 ? 'bg-brand-tech' : 'bg-sky-200'}`}
                    style={{ height: `${Math.max((val / maxBarra) * 100, val > 0 ? 6 : 2)}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-1 flex gap-2 text-xs text-slate-400">
            {consumo.map((x) => <span key={x.fecha} className="flex-1 text-center">{diaCorto(x.fecha)}</span>)}
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-xs">
            <div><dt className="text-slate-500">{t('dash.consumoPromedio')}</dt><dd className="mt-0.5 text-sm font-bold text-ink">{k ? `${fmtNum(promedio)} ${t('dash.uDia')}` : '—'}</dd></div>
            <div><dt className="text-slate-500">{t('dash.stockActual')}</dt><dd className="mt-0.5 text-sm font-bold text-ink">{k ? `${fmtNum(k.unidades_totales)} ${t('dash.u')}` : '—'}</dd></div>
            <div><dt className="text-slate-500">{t('dash.estimacion')}</dt><dd className="mt-0.5 text-sm font-bold text-ink">{dias !== null ? t('dash.dias', { n: fmtNum(Math.round(dias)) }) : '—'}</dd></div>
          </dl>

          {dias !== null && dias < 7 && (
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              <Icon name="tendencia" className="h-3.5 w-3.5" /> {t('dash.reabastecer')}
            </p>
          )}
        </Card>

        <Card
          titulo={t('dash.ultimaAuditoria')}
          accion={<span className="text-brand-tech"><Icon name="calendario" className="h-4 w-4" /></span>}
        >
          {d && !aud ? (
            <p className="py-6 text-center text-sm text-slate-500">{t('dash.sinAuditorias')}</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">{t('comun.fecha')}</dt><dd className="font-semibold text-ink">{aud ? fmtFechaLarga(aud.fecha) : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">{t('dash.responsable')}</dt><dd className="font-semibold text-ink">{aud?.responsable ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">{t('dash.revisados')}</dt><dd className="font-semibold text-ink">{aud ? fmtNum(aud.productos_revisados) : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">{t('dash.diferencias')}</dt><dd className={`font-semibold ${aud && aud.diferencias > 0 ? 'text-warn' : 'text-ink'}`}>{aud ? fmtNum(aud.diferencias) : '—'}</dd></div>
            </dl>
          )}
          <Link to="/admin/auditorias" className="mt-5 block rounded-lg border border-brand px-4 py-2 text-center text-sm font-semibold text-brand hover:bg-cyan-50">
            {t('dash.verAuditoria')}
          </Link>
        </Card>
      </div>
    </div>
  )
}
