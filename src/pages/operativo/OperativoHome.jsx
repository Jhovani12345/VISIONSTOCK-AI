import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { listarMovimientos } from '../../services/movimientos'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import TablaMovimientos from '../movimientos/TablaMovimientos'
import { t } from '../../i18n'

const ACCIONES = [
  { to: '/entradas', icono: 'entradas', titulo: 'oper.regEntrada', texto: 'oper.ingreso', tono: 'bg-emerald-50 text-brand-ia' },
  { to: '/salidas', icono: 'salidas', titulo: 'oper.regSalida', texto: 'oper.salidaMerc', tono: 'bg-sky-50 text-brand-tech' },
  { to: '/inventario', icono: 'inventario', titulo: 'oper.consultar', texto: 'oper.existUbic', tono: 'bg-amber-50 text-warn' },
]

export default function OperativoHome() {
  const { perfil } = useAuth()
  const [movs, setMovs] = useState([])

  useEffect(() => {
    let cancelado = false
    listarMovimientos({ porPagina: 5 })
      .then((r) => !cancelado && setMovs(r.filas))
      .catch(() => {})
    return () => { cancelado = true }
  }, [])

  return (
    <div className="space-y-5">
      <p className="text-lg font-semibold text-ink">{t('oper.hola', { nombre: perfil.nombre })}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {ACCIONES.map((a) => (
          <Link key={a.to} to={a.to} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-brand-tech">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.tono}`}>
              <Icon name={a.icono} className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{t(a.titulo)}</span>
              <span className="block text-xs text-slate-500">{t(a.texto)}</span>
            </span>
          </Link>
        ))}
      </div>

      <Card
        titulo={t('oper.misMov')}
        accion={<Link to="/movimientos" className="text-xs font-semibold text-brand-tech hover:underline">{t('comun.verTodos')} ›</Link>}
      >
        <TablaMovimientos filas={movs} />
      </Card>
    </div>
  )
}
