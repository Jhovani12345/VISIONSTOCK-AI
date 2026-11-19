import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { traducirError } from '../../lib/errores'
import AuthShell from '../../components/ui/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'
import { t } from '../../i18n'

const VACIO = { nombre: '', apellido: '', correo: '', password: '', confirmar: '' }

export default function Registro() {
  const { signUp } = useAuth()
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [pendienteConfirmar, setPendienteConfirmar] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  function validar() {
    if (!form.nombre.trim()) return t('auth.nombreReq')
    if (!/^\S+@\S+\.\S+$/.test(form.correo.trim())) return t('auth.correoInvalido')
    if (form.password.length < 8) return t('auth.passwordCorta')
    if (form.password !== form.confirmar) return t('auth.noCoinciden')
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
    <Link to="/login" className="font-semibold text-cyan-300 hover:underline">{t('auth.iniciaSesion')}</Link>
  )

  if (pendienteConfirmar) {
    return (
      <AuthShell titulo={t('auth.revisaCorreo')} pie={<>{t('auth.yaConfirmaste')} {linkLogin}</>}>
        <Alert oscuro tipo="exito">
          {t('auth.enviamosConfirmacion', { correo: form.correo })}
        </Alert>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      logo={false}
      titulo={t('auth.crearCuenta')}
      subtitulo={t('auth.registroSub')}
      pie={<>{t('auth.yaTienes')} {linkLogin}</>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert oscuro tipo="error">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField ocultarEtiqueta label={t('auth.nombre')} id="nombre" autoComplete="given-name" required value={form.nombre} onChange={onChange} />
          <AuthField ocultarEtiqueta label={t('auth.apellido')} id="apellido" autoComplete="family-name" value={form.apellido} onChange={onChange} />
        </div>
        <AuthField ocultarEtiqueta label={t('auth.correo')} id="correo" type="email" autoComplete="email" required value={form.correo} onChange={onChange} />
        <AuthField ocultarEtiqueta label={t('auth.password')} id="password" type="password" autoComplete="new-password" required
          ayuda={t('auth.min8')} value={form.password} onChange={onChange} />
        <AuthField ocultarEtiqueta label={t('auth.confirmarPassword')} id="confirmar" type="password" autoComplete="new-password" required
          value={form.confirmar} onChange={onChange} />
        <AuthButton type="submit" invertido cargando={enviando}>{t('auth.registrarse')}</AuthButton>
      </form>
    </AuthShell>
  )
}
