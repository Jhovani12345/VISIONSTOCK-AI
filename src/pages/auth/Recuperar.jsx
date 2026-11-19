import { useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitarRecuperacion } from '../../services/auth'
import { traducirError } from '../../lib/errores'
import AuthShell from '../../components/ui/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'

export default function Recuperar() {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) return setError('Ingresa un correo válido.')
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
    <Link to="/login" className="font-semibold text-cyan-300 hover:underline">Volver a iniciar sesión</Link>
  )

  return (
    <AuthShell titulo="Recuperar contraseña" subtitulo="Te enviaremos un enlace para restablecerla." pie={pie}>
      {enviado ? (
        // Mensaje genérico: no revela si el correo existe.
        <Alert oscuro tipo="exito">
          Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && <Alert oscuro tipo="error">{error}</Alert>}
          <AuthField label="Correo electrónico" id="correo" type="email" autoComplete="email" required
            placeholder="usuario@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          <AuthButton type="submit" cargando={enviando} disabled={!correo}>Enviar enlace</AuthButton>
        </form>
      )}
    </AuthShell>
  )
}
