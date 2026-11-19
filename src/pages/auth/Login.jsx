import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { traducirError } from '../../lib/errores'
import AuthShell from '../../components/ui/AuthShell'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
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
      subtitulo="Ingresa con tus credenciales para continuar."
      pie={
        <>
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="font-semibold text-brand-tech hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert tipo="error">{error}</Alert>}
        <Field label="Correo electrónico" id="correo" type="email" autoComplete="email" required
          placeholder="tucorreo@empresa.com" value={form.correo} onChange={onChange} />
        <Field label="Contraseña" id="password" type="password" autoComplete="current-password" required
          value={form.password} onChange={onChange} />
        <Button type="submit" cargando={enviando} className="w-full"
          disabled={!form.correo || !form.password}>
          Iniciar sesión
        </Button>
      </form>
    </AuthShell>
  )
}
