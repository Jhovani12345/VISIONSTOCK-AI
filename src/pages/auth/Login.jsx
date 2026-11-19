import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { traducirError } from '../../lib/errores'
import AuthShell from '../../components/ui/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'

export default function Login() {
  const { signIn } = useAuth()
  const [form, setForm] = useState({ correo: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    const { error } = await signIn(form.correo.trim(), form.password)
    if (error) setError(traducirError(error))
    setEnviando(false)
    // Si todo sale bien, GuestRoute redirige según el rol al cargar el perfil.
  }

  return (
    <AuthShell
      titulo="Iniciar sesión"
      subtitulo="Accede a tu panel de inventario inteligente"
      pie={
        <>
          O{' '}
          <Link to="/registro" className="font-semibold text-cyan-300 hover:underline">
            regístrate gratis
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert oscuro tipo="error">{error}</Alert>}
        <AuthField label="Correo electrónico" id="correo" type="email" autoComplete="email" required
          placeholder="usuario@correo.com" value={form.correo} onChange={onChange} />
        <AuthField label="Contraseña" id="password" type="password" autoComplete="current-password" required
          value={form.password} onChange={onChange} />
        <div className="text-right">
          <Link to="/recuperar" className="text-xs text-slate-300 hover:text-cyan-300 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <AuthButton type="submit" cargando={enviando} disabled={!form.correo || !form.password}>
          Iniciar sesión
        </AuthButton>
      </form>
    </AuthShell>
  )
}
