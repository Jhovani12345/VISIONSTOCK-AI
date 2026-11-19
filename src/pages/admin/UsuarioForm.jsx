import { useState } from 'react'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { traducirErrorDB } from '../../lib/errores'
import { ETIQUETA_ROL, ROLES } from '../../lib/constants'

export default function UsuarioForm({ usuario, esPropio, onGuardar, onCancelar }) {
  const editando = Boolean(usuario)
  const [f, setF] = useState({
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    correo: usuario?.correo ?? '',
    password: '',
    rol: usuario?.rol?.nombre_rol ?? ROLES.TRABAJADOR_ALMACEN,
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const onChange = (e) => setF((x) => ({ ...x, [e.target.name]: e.target.value }))

  function validar() {
    if (!f.nombre.trim()) return 'El nombre es obligatorio.'
    if (!editando) {
      if (!/^\S+@\S+\.\S+$/.test(f.correo.trim())) return 'Ingresa un correo válido.'
      if (f.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    }
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    const msg = validar()
    if (msg) return setError(msg)

    const payload = { nombre: f.nombre.trim(), apellido: f.apellido.trim(), rol: f.rol }
    if (!editando) {
      payload.correo = f.correo.trim()
      payload.password = f.password
    }

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
        <Field label="Nombre" id="nombre" required maxLength={50} value={f.nombre} onChange={onChange} />
        <Field label="Apellido" id="apellido" maxLength={80} value={f.apellido} onChange={onChange} />
      </div>

      {editando ? (
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Correo electrónico</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600 ring-1 ring-slate-200">{usuario.correo}</p>
        </div>
      ) : (
        <>
          <Field label="Correo electrónico" id="correo" type="email" autoComplete="off" required value={f.correo} onChange={onChange} />
          <Field label="Contraseña inicial" id="password" type="password" autoComplete="new-password" required
            placeholder="Mínimo 8 caracteres" value={f.password} onChange={onChange} />
        </>
      )}

      <div>
        <label htmlFor="rol" className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
        <select
          id="rol" name="rol" value={f.rol} onChange={onChange} disabled={esPropio}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30 disabled:bg-slate-50 disabled:text-slate-500"
        >
          {Object.values(ROLES).map((r) => <option key={r} value={r}>{ETIQUETA_ROL[r]}</option>)}
        </select>
        {esPropio && <p className="mt-1 text-xs text-slate-500">No puedes cambiar tu propio rol.</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variante="suave" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" cargando={guardando}>{editando ? 'Guardar cambios' : 'Crear usuario'}</Button>
      </div>
    </form>
  )
}
