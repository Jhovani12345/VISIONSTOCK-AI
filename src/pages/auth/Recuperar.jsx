import { useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitarRecuperacion } from '../../services/auth'
import { traducirError } from '../../lib/errores'
import AuthShell from '../../components/ui/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'
import { t } from '../../i18n'

export default function Recuperar() {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) return setError(t('auth.correoInvalido'))
    setError('')
    setEnviando(true)
    try {
      await solicitarRecuperacion(correo.trim())
      setEnviado(true)
    } catch (err) {
      setError(traducirError(err))
    } finally {
      setEnviando(false)
    }
  }

  const pie = (
    <Link to="/login" className="font-semibold text-cyan-300 hover:underline">{t('auth.volverLogin')}</Link>
  )

  return (
    <AuthShell titulo={t('auth.recuperar')} subtitulo={t('auth.recuperarSub')} pie={pie}>
      {enviado ? (
        // Mensaje genérico: no revela si el correo existe.
        <Alert oscuro tipo="exito">
          {t('auth.recuperarEnviado')}
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && <Alert oscuro tipo="error">{error}</Alert>}
          <AuthField label={t('auth.correo')} id="correo" type="email" autoComplete="email" required
            placeholder="usuario@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          <AuthButton type="submit" cargando={enviando} disabled={!correo}>{t('auth.enviarEnlace')}</AuthButton>
        </form>
      )}
    </AuthShell>
  )
}
