import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarMovimientos } from '../../services/movimientos'
import { traducirErrorDB } from '../../lib/errores'
import { useAuth } from '../../hooks/useAuth'
import Alert from '../../components/ui/Alert'
import Card from '../../components/ui/Card'
import Paginacion from '../../components/ui/Paginacion'
import TablaMovimientos from './TablaMovimientos'

const POR_PAGINA = 10
const FILTROS = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'ENTRADA', etiqueta: 'Entradas' },
  { valor: 'SALIDA', etiqueta: 'Salidas' },
]

export default function HistorialMovimientos() {
  const { esAdmin } = useAuth()
  const [params] = useSearchParams()
  const inicial = ['ENTRADA', 'SALIDA'].includes(params.get('tipo')) ? params.get('tipo') : 'TODOS'
  const [tipo, setTipo] = useState(inicial)
  const [pagina, setPagina] = useState(1)
  const [datos, setDatos] = useState({ filas: [], total: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setError('')
    listarMovimientos({ tipo, pagina, porPagina: POR_PAGINA })
      .then((r) => {
        if (cancelado) return
        const paginas = Math.max(1, Math.ceil(r.total / POR_PAGINA))
        if (pagina > paginas) return setPagina(paginas)
        setDatos(r)
      })
      .catch((e) => !cancelado && setError(traducirErrorDB(e)))
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [tipo, pagina])

  return (
    <Card>
      {error && <div className="mb-4"><Alert tipo="error">{error}</Alert></div>}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            aria-pressed={tipo === f.valor}
            onClick={() => { setTipo(f.valor); setPagina(1) }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tipo === f.valor ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      <div className={cargando ? 'opacity-60' : ''} aria-busy={cargando}>
        <TablaMovimientos
          filas={datos.filas}
          mostrarUsuario={esAdmin}
          fechaCompleta
          vacio={cargando ? 'Cargando…' : 'No hay movimientos para este filtro.'}
        />
      </div>
      {datos.total > 0 && <Paginacion pagina={pagina} porPagina={POR_PAGINA} total={datos.total} onCambiar={setPagina} />}
    </Card>
  )
}
