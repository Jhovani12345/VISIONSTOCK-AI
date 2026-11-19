import { useEffect, useState } from 'react'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { traducirErrorDB } from '../../lib/errores'
import { CONFIG_DEFECTO, obtenerConfiguracion } from '../../services/configuracion'
import { t } from '../../i18n'

export default function ProductoForm({ producto, onGuardar, onCancelar }) {
  const editando = Boolean(producto)
  const [f, setF] = useState({
    codigo_barras: producto?.codigo_barras ?? '',
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    unidad_medida: producto?.unidad_medida ?? 'PIEZA',
    ubicacion: producto?.ubicacion ?? '',
    stock_minimo: String(producto?.stock_minimo ?? 0),
    existencia_inicial: '0',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [catalogo, setCatalogo] = useState(CONFIG_DEFECTO.unidades_medida)
  const [tocado, setTocado] = useState(false)

  // Unidades y stock mínimo predeterminado desde Configuración
  useEffect(() => {
    obtenerConfiguracion().then((c) => {
      setCatalogo(c.unidades_medida)
      if (!editando && !tocado) {
        setF((x) => ({
          ...x,
          stock_minimo: String(c.stock_minimo_predeterminado ?? 0),
          unidad_medida: c.unidades_medida.includes(x.unidad_medida) ? x.unidad_medida : c.unidades_medida[0],
        }))
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (e) => { setTocado(true); setF((x) => ({ ...x, [e.target.name]: e.target.value })) }
  const unidades = [...new Set([...catalogo, f.unidad_medida])]

  function validar() {
    if (!f.codigo_barras.trim()) return t('prod.codigoReq')
    if (!f.nombre.trim()) return t('prod.nombreReq')
    const min = Number(f.stock_minimo)
    if (f.stock_minimo === '' || Number.isNaN(min) || min < 0) return t('prod.minimoInv')
    if (!editando) {
      const ini = Number(f.existencia_inicial)
      if (f.existencia_inicial === '' || Number.isNaN(ini) || ini < 0) return t('prod.inicialInv')
    }
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    const msg = validar()
    if (msg) return setError(msg)

    const payload = {
      codigo_barras: f.codigo_barras.trim(),
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim() || null,
      unidad_medida: f.unidad_medida,
      ubicacion: f.ubicacion.trim() || null,
      stock_minimo: Number(f.stock_minimo),
    }
    if (!editando) payload.existencia_inicial = Number(f.existencia_inicial)

    setError('')
    setGuardando(true)
    try {
      await onGuardar(payload)
    } catch (err) {
      setError(traducirErrorDB(err))
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert tipo="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('prod.codigo')} id="codigo_barras" required maxLength={50} value={f.codigo_barras} onChange={onChange} />
        <Field label={t('prod.nombre')} id="nombre" required maxLength={100} value={f.nombre} onChange={onChange} />
      </div>

      <Field label={t('prod.descripcion')} id="descripcion" maxLength={250} value={f.descripcion} onChange={onChange} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="unidad_medida" className="mb-1 block text-sm font-medium text-slate-700">{t('prod.unidad')}</label>
          <select
            id="unidad_medida" name="unidad_medida" value={f.unidad_medida} onChange={onChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30"
          >
            {unidades.map((u) => <option key={u} value={u}>{u.charAt(0) + u.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
        <Field label={t('prod.ubicacion')} id="ubicacion" maxLength={80} placeholder={t('prod.ubicacionEj')} value={f.ubicacion} onChange={onChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('prod.minimo')} id="stock_minimo" type="number" inputMode="decimal" min="0" step="any" value={f.stock_minimo} onChange={onChange} />
        {!editando && (
          <Field label={t('prod.inicial')} id="existencia_inicial" type="number" inputMode="decimal" min="0" step="any" value={f.existencia_inicial} onChange={onChange} />
        )}
      </div>

      {editando && (
        <p className="text-xs text-slate-500">
          {t('prod.soloMov')}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variante="suave" onClick={onCancelar}>{t('comun.cancelar')}</Button>
        <Button type="submit" cargando={guardando}>{editando ? t('prod.guardarCambios') : t('prod.registrar')}</Button>
      </div>
    </form>
  )
}
