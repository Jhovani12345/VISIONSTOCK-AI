import { useEffect, useState } from 'react'
import { guardarConfiguracion, obtenerConfiguracion } from '../../services/configuracion'
import { cambiarPassword } from '../../services/auth'
import { traducirError, traducirErrorDB } from '../../lib/errores'
import { fmtFecha } from '../../lib/formato'
import { useAuth } from '../../hooks/useAuth'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Field from '../../components/ui/Field'

const entero = (v, min, max) => {
  const n = Number(v)
  return Number.isInteger(n) && n >= min && n <= max
}

function Unidades({ valor, onChange }) {
  const [nueva, setNueva] = useState('')
  function agregar(e) {
    e.preventDefault()
    const u = nueva.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 30)
    if (u && !valor.includes(u)) onChange([...valor, u])
    setNueva('')
  }
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">Unidades de medida</p>
      <ul className="flex flex-wrap gap-2">
        {valor.map((u) => (
          <li key={u} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-xs font-medium text-slate-700">
            {u.charAt(0) + u.slice(1).toLowerCase()}
            <button
              type="button"
              onClick={() => onChange(valor.filter((x) => x !== u))}
              disabled={valor.length <= 1}
              aria-label={`Quitar ${u}`}
              className="rounded-full px-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          aria-label="Nueva unidad de medida" placeholder="Ej. Rollo" value={nueva} maxLength={30}
          onChange={(e) => setNueva(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && agregar(e)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30"
        />
        <Button type="button" variante="suave" onClick={agregar}>Agregar</Button>
      </div>
      <p className="mt-1 text-xs text-slate-500">Quitar una unidad no modifica los productos que ya la usan.</p>
    </div>
  )
}

function CambiarPassword() {
  const { perfil } = useAuth()
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [msg, setMsg] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (p1.length < 8) return setMsg({ tipo: 'error', texto: 'La contraseña debe tener al menos 8 caracteres.' })
    if (p1 !== p2) return setMsg({ tipo: 'error', texto: 'Las contraseñas no coinciden.' })
    setEnviando(true)
    setMsg(null)
    try {
      await cambiarPassword(p1)
      setP1('')
      setP2('')
      setMsg({ tipo: 'exito', texto: 'Contraseña actualizada.' })
    } catch (err) {
      setMsg({ tipo: 'error', texto: traducirError(err) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card titulo="Mi cuenta" subtitulo={perfil?.correo}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {msg && <Alert tipo={msg.tipo}>{msg.texto}</Alert>}
        <Field label="Nueva contraseña" id="nueva-password" type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} />
        <Field label="Confirmar contraseña" id="confirmar-password" type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} />
        <Button type="submit" variante="suave" cargando={enviando} className="w-full">Cambiar contraseña</Button>
      </form>
    </Card>
  )
}

export default function ConfiguracionPage() {
  const [f, setF] = useState(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    obtenerConfiguracion({ forzar: true }).then((c) =>
      setF({
        ...c,
        dias_cobertura: String(c.dias_cobertura),
        ventana_analisis: String(c.ventana_analisis),
        dias_alerta_reabasto: String(c.dias_alerta_reabasto),
        stock_minimo_predeterminado: String(c.stock_minimo_predeterminado),
      })
    )
  }, [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(t)
  }, [aviso])

  if (!f) return <p className="py-10 text-center text-sm text-slate-500">Cargando…</p>

  const onChange = (e) => setF((x) => ({ ...x, [e.target.name]: e.target.value }))

  function validar() {
    if (!f.nombre_almacen.trim()) return 'El nombre del almacén es obligatorio.'
    const min = Number(f.stock_minimo_predeterminado)
    if (f.stock_minimo_predeterminado === '' || Number.isNaN(min) || min < 0) return 'El stock mínimo predeterminado debe ser 0 o mayor.'
    if (!entero(f.ventana_analisis, 7, 365)) return 'El periodo de análisis debe ser un entero entre 7 y 365 días.'
    if (!entero(f.dias_cobertura, 1, 365)) return 'Los días de cobertura deben ser un entero entre 1 y 365.'
    if (!entero(f.dias_alerta_reabasto, 1, 90)) return 'El umbral de riesgo debe ser un entero entre 1 y 90 días.'
    if (!f.unidades_medida.length) return 'Debe existir al menos una unidad de medida.'
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    const msg = validar()
    if (msg) return setError(msg)
    setError('')
    setGuardando(true)
    try {
      const c = await guardarConfiguracion({
        nombre_almacen: f.nombre_almacen.trim(),
        stock_minimo_predeterminado: Number(f.stock_minimo_predeterminado),
        ventana_analisis: Number(f.ventana_analisis),
        dias_cobertura: Number(f.dias_cobertura),
        dias_alerta_reabasto: Number(f.dias_alerta_reabasto),
        unidades_medida: f.unidades_medida,
      })
      setF((x) => ({ ...x, fecha_actualizacion: c.fecha_actualizacion }))
      setAviso('Configuración guardada.')
      window.dispatchEvent(new Event('configuracion-actualizada'))
    } catch (err) {
      const sinTabla = ['42P01', 'PGRST205', 'PGRST116'].includes(err?.code)
      setError(sinTabla ? 'Falta ejecutar la migración database/007_configuracion.sql en Supabase.' : traducirErrorDB(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <form onSubmit={onSubmit} className="space-y-5 lg:col-span-2" noValidate>
        {aviso && <Alert tipo="exito">{aviso}</Alert>}
        {error && <Alert tipo="error">{error}</Alert>}

        <Card titulo="General">
          <div className="space-y-4">
            <Field label="Nombre del almacén" id="nombre_almacen" maxLength={80} value={f.nombre_almacen} onChange={onChange} />
            <Field
              label="Stock mínimo predeterminado para productos nuevos" id="stock_minimo_predeterminado"
              type="number" inputMode="decimal" min="0" step="any" value={f.stock_minimo_predeterminado} onChange={onChange}
            />
            <Unidades valor={f.unidades_medida} onChange={(u) => setF((x) => ({ ...x, unidades_medida: u }))} />
          </div>
        </Card>

        <Card titulo="Análisis y reabastecimiento" subtitulo="Se usan en el módulo de Análisis">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Periodo de análisis (días)" id="ventana_analisis" type="number" min="7" max="365" step="1" value={f.ventana_analisis} onChange={onChange} />
            <Field label="Cobertura deseada (días)" id="dias_cobertura" type="number" min="1" max="365" step="1" value={f.dias_cobertura} onChange={onChange} />
            <Field label="Riesgo si se agota en (días)" id="dias_alerta_reabasto" type="number" min="1" max="90" step="1" value={f.dias_alerta_reabasto} onChange={onChange} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Cantidad sugerida = consumo promedio × cobertura + stock mínimo − existencia.
          </p>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{f.fecha_actualizacion ? `Última modificación: ${fmtFecha(f.fecha_actualizacion)}` : ''}</p>
          <Button type="submit" cargando={guardando}>Guardar cambios</Button>
        </div>
      </form>

      <div>
        <CambiarPassword />
      </div>
    </div>
  )
}
