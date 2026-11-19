import { useState } from 'react'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { traducirErrorDB } from '../../lib/errores'

const UNIDADES = ['PIEZA', 'CAJA', 'PAQUETE', 'KG', 'LITRO', 'METRO']

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

  const onChange = (e) => setF((x) => ({ ...x, [e.target.name]: e.target.value }))
  const unidades = [...new Set([...UNIDADES, f.unidad_medida])]

  function validar() {
    if (!f.codigo_barras.trim()) return 'El código de barras es obligatorio.'
    if (!f.nombre.trim()) return 'El nombre es obligatorio.'
    const min = Number(f.stock_minimo)
    if (f.stock_minimo === '' || Number.isNaN(min) || min < 0) return 'El stock mínimo debe ser un número mayor o igual a 0.'
    if (!editando) {
      const ini = Number(f.existencia_inicial)
      if (f.existencia_inicial === '' || Number.isNaN(ini) || ini < 0) return 'La existencia inicial debe ser un número mayor o igual a 0.'
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
        <Field label="Código de barras / SKU" id="codigo_barras" required maxLength={50} value={f.codigo_barras} onChange={onChange} />
        <Field label="Nombre" id="nombre" required maxLength={100} value={f.nombre} onChange={onChange} />
      </div>

      <Field label="Descripción (opcional)" id="descripcion" maxLength={250} value={f.descripcion} onChange={onChange} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="unidad_medida" className="mb-1 block text-sm font-medium text-slate-700">Unidad de medida</label>
          <select
            id="unidad_medida" name="unidad_medida" value={f.unidad_medida} onChange={onChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30"
          >
            {unidades.map((u) => <option key={u} value={u}>{u.charAt(0) + u.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
        <Field label="Ubicación (pasillo y estante)" id="ubicacion" maxLength={80} placeholder="Pasillo 3, Estante B" value={f.ubicacion} onChange={onChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Stock mínimo" id="stock_minimo" type="number" inputMode="decimal" min="0" step="any" value={f.stock_minimo} onChange={onChange} />
        {!editando && (
          <Field label="Existencia inicial" id="existencia_inicial" type="number" inputMode="decimal" min="0" step="any" value={f.existencia_inicial} onChange={onChange} />
        )}
      </div>

      {editando && (
        <p className="text-xs text-slate-500">
          La existencia solo cambia mediante entradas, salidas o auditorías, no desde este formulario.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variante="suave" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" cargando={guardando}>{editando ? 'Guardar cambios' : 'Registrar producto'}</Button>
      </div>
    </form>
  )
}
