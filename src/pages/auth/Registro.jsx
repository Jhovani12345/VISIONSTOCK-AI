import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { traducirError } from '../../lib/errores'
import AuthShell from '../../components/ui/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'

const VACIO = { nombre: '', apellido: '', correo: '', password: '', confirmar: '' }

export default function Registro() {
  const { signUp } = useAuth()
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [pendienteConfirmar, setPendienteConfirmar] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  function validar() {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.'
    if (!/^\S+@\S+\.\S+$/.test(form.correo.trim())) return 'Ingresa un correo válido.'
    if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    if (form.password !== form.confirmar) return 'Las contraseñas no coinciden.'
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    const msg = validar()
    if (msg) return setError(msg)

    setError('')
    setEnviando(true)
    const { data, error } = await signUp(form.correo.trim(), form.password, form.nombre.trim(), form.apellido.trim())
    setEnviando(false)

    if (error) return setError(traducirError(error))
    if (!data.session) setPendienteConfirmar(true) // "Confirm email" activo en Supabase
  }

  const linkLogin = (
    <Link to="/login" className="font-semibold text-cyan-300 hover:underline">Inicia sesión</Link>
  )

  if (pendienteConfirmar) {
    return (
      <AuthShell titulo="Revisa tu correo" pie={<>¿Ya confirmaste? {linkLogin}</>}>
        <Alert oscuro tipo="exito">
          Te enviamos un enlace de confirmación a {form.correo}. Ábrelo para activar tu cuenta.
        </Alert>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      logo={false}
      titulo="Crear cuenta"
      subtitulo="Regístrate para usar VisionStock AI."
      pie={<>¿Ya tienes cuenta? {linkLogin}</>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert oscuro tipo="error">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField ocultarEtiqueta label="Nombre" id="nombre" autoComplete="given-name" required value={form.nombre} onChange={onChange} />
          <AuthField ocultarEtiqueta label="Apellido" id="apellido" autoComplete="family-name" value={form.apellido} onChange={onChange} />
        </div>
        <AuthField ocultarEtiqueta label="Correo electrónico" id="correo" type="email" autoComplete="email" required value={form.correo} onChange={onChange} />
        <AuthField ocultarEtiqueta label="Contraseña" id="password" type="password" autoComplete="new-password" required
          ayuda="mínimo 8 caracteres" value={form.password} onChange={onChange} />
        <AuthField ocultarEtiqueta label="Confirmar contraseña" id="confirmar" type="password" autoComplete="new-password" required
          value={form.confirmar} onChange={onChange} />
        <AuthButton type="submit" invertido cargando={enviando}>Registrarse</AuthButton>
      </form>
    </AuthShell>
  )
}
