import { useAuth } from '../../hooks/useAuth'
import AuthShell from '../../components/ui/AuthShell'
import AuthButton from '../../components/auth/AuthButton'
import Alert from '../../components/ui/Alert'

export default function PerfilBloqueado({ sinPerfil }) {
  const { signOut } = useAuth()
  return (
    <AuthShell titulo="No puedes acceder">
      <div className="space-y-4">
        <Alert oscuro tipo="error">
          {sinPerfil
            ? 'No pudimos cargar tu perfil. Intenta de nuevo o contacta al administrador.'
            : 'Tu cuenta está desactivada. Contacta al administrador.'}
        </Alert>
        <AuthButton onClick={signOut}>Cerrar sesión</AuthButton>
      </div>
    </AuthShell>
  )
}
