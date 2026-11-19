import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cambiarPassword } from '../../services/auth'
import { traducirError } from '../../lib/errores'
import AuthShell from '../../components/ui/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'
import Cargando from '../../components/ui/Cargando'

// Ruta pública a propósito: el enlace del correo crea una sesión de recuperación,
// y GuestRoute lo mandaría al dashboard antes de poder cambiar la contraseña.
export default function Restablecer() {
  const { session, cargando } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)

  if (cargando) return <Cargando />

  if (!session) {
    return (
      <AuthShell titulo="Enlace no válido" subtitulo="El enlace expiró o ya fue utilizado."
        pie={<Link to="/recuperar" className="font-semibold text-cyan-300 hover:underline">Solicitar uno nuevo</Link>}>
        <Alert oscuro tipo="error">No pudimos validar tu enlace de recuperación.</Alert>
      </AuthShell>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (password !== confirmar) return setError('Las contraseñas no coinciden.')
    setError('')
    setEnviando(true)
    try {
      await cambiarPassword(password)
      setListo(true)
    } catch (err) {
      setError(traducirError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (listo) {
    return (
      <AuthShell titulo="Contraseña actualizada">
        <div className="space-y-4">
          <Alert oscuro tipo="exito">Tu contraseña se cambió correctamente.</Alert>
          <AuthButton onClick={() => navigate('/', { replace: true })}>Continuar</AuthButton>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell titulo="Nueva contraseña" subtitulo="Elige una contraseña segura para tu cuenta.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert oscuro tipo="error">{error}</Alert>}
        <AuthField ocultarEtiqueta label="Nueva contraseña" id="password" type="password" autoComplete="new-password"
          ayuda="mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
        <AuthField ocultarEtiqueta label="Confirmar contraseña" id="confirmar" type="password" autoComplete="new-password"
          value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
        <AuthButton type="submit" invertido cargando={enviando}>Guardar contraseña</AuthButton>
      </form>
    </AuthShell>
  )
}
