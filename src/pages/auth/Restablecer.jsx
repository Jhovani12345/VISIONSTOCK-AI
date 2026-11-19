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
import { t } from '../../i18n'

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
      <AuthShell titulo={t('auth.enlaceInvalido')} subtitulo={t('auth.enlaceExpirado')}
        pie={<Link to="/recuperar" className="font-semibold text-cyan-300 hover:underline">{t('auth.solicitarNuevo')}</Link>}>
        <Alert oscuro tipo="error">{t('auth.noValidado')}</Alert>
      </AuthShell>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (password.length < 8) return setError(t('auth.passwordCorta'))
    if (password !== confirmar) return setError(t('auth.noCoinciden'))
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
      <AuthShell titulo={t('auth.passwordActualizada')}>
        <div className="space-y-4">
          <Alert oscuro tipo="exito">{t('auth.passwordCambiada')}</Alert>
          <AuthButton onClick={() => navigate('/', { replace: true })}>{t('auth.continuar')}</AuthButton>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell titulo={t('auth.nuevaPassword')} subtitulo={t('auth.nuevaPasswordSub')}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert oscuro tipo="error">{error}</Alert>}
        <AuthField ocultarEtiqueta label={t('auth.nuevaPassword')} id="password" type="password" autoComplete="new-password"
          ayuda={t('auth.min8')} value={password} onChange={(e) => setPassword(e.target.value)} />
        <AuthField ocultarEtiqueta label={t('auth.confirmarPassword')} id="confirmar" type="password" autoComplete="new-password"
          value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
        <AuthButton type="submit" invertido cargando={enviando}>{t('auth.guardarPassword')}</AuthButton>
      </form>
    </AuthShell>
  )
}
