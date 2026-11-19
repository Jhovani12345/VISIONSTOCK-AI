import { useAuth } from '../../hooks/useAuth'
import AuthShell from '../../components/ui/AuthShell'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'

export default function PerfilBloqueado({ sinPerfil }) {
  const { signOut } = useAuth()
  return (
    <AuthShell titulo="No puedes acceder">
      <div className="space-y-4">
        <Alert tipo="error">
          {sinPerfil
            ? 'No pudimos cargar tu perfil. Intenta de nuevo o contacta al administrador.'
            : 'Tu cuenta está desactivada. Contacta al administrador.'}
        </Alert>
        <Button variante="suave" onClick={signOut} className="w-full">
          Cerrar sesión
        </Button>
      </div>
    </AuthShell>
  )
}
