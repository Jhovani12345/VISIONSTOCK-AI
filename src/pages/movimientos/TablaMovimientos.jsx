import BadgeEstado from '../../components/ui/BadgeEstado'
import Icon from '../../components/ui/Icon'
import { fmtFecha, fmtFechaRelativa, fmtNum } from '../../lib/formato'
import { t } from '../../i18n'

export default function TablaMovimientos({
  filas,
  mostrarUsuario = false,
  fechaCompleta = false,
  vacio = t('dash.sinMov'),
}) {
  if (!filas.length) return <p className="py-8 text-center text-sm text-slate-500">{vacio}</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-500">
            <th className="pb-2 pr-3 font-medium">{t('comun.producto')}</th>
            <th className="pb-2 pr-3 font-medium">{t('comun.tipo')}</th>
            <th className="pb-2 pr-3 text-right font-medium">{t('comun.cantidad')}</th>
            <th className="pb-2 pr-3 font-medium">{t('comun.fecha')}</th>
            {mostrarUsuario && <th className="pb-2 pr-3 font-medium">{t('comun.usuario')}</th>}
            <th className="pb-2 font-medium">{t('comun.estado')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((m) => {
            const entrada = m.tipo_movimiento === 'ENTRADA'
            return (
              <tr key={m.id_movimiento}>
                <td className="py-3 pr-3 font-medium text-ink">{m.producto?.nombre ?? '—'}</td>
                <td className="py-3 pr-3">
                  <span className={`inline-flex items-center gap-1.5 ${entrada ? 'text-emerald-600' : 'text-slate-600'}`}>
                    <Icon name={entrada ? 'entradas' : 'salidas'} className="h-3.5 w-3.5" />
                    {entrada ? t('mov.entrada') : t('mov.salida')}
                  </span>
                </td>
                <td className={`py-3 pr-3 text-right font-semibold tabular-nums ${entrada ? 'text-emerald-600' : 'text-danger'}`}>
                  {entrada ? '+' : '-'}{fmtNum(m.cantidad)}
                </td>
                <td className="py-3 pr-3 text-slate-500">
                  <span title={fmtFecha(m.fecha_movimiento)}>
                    {fechaCompleta ? fmtFecha(m.fecha_movimiento) : fmtFechaRelativa(m.fecha_movimiento)}
                  </span>
                </td>
                {mostrarUsuario && (
                  <td className="py-3 pr-3 text-slate-600">
                    {m.perfil ? `${m.perfil.nombre} ${m.perfil.apellido}`.trim() : '—'}
                  </td>
                )}
                <td className="py-3"><BadgeEstado estado="COMPLETADO" /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
