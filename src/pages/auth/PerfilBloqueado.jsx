import { useAuth } from '../../hooks/useAuth'
import AuthShell from '../../components/ui/AuthShell'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'
import { t } from '../../i18n'

export default function PerfilBloqueado({ sinPerfil }) {
  const { signOut } = useAuth()
  return (
    <AuthShell titulo={t('auth.noPuedes')}>
      <div className="space-y-4">
        <Alert oscuro tipo="error">
          {sinPerfil
            ? t('auth.sinPerfil')
            : t('auth.desactivada')}
        </Alert>
        <AuthButton onClick={signOut}>{t('layout.cerrarSesion')}</AuthButton>
      </div>
    </AuthShell>
  )
}
