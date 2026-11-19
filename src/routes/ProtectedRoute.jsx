import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Cargando from '../components/ui/Cargando'
import PerfilBloqueado from '../pages/auth/PerfilBloqueado'

// Sin `roles`: basta con tener sesión activa. Con `roles`: además debe coincidir el rol.
// Nota: esto es control de UX. La seguridad real la imponen las políticas RLS en Supabase.
export default function ProtectedRoute({ roles }) {
  const { session, perfil, rol, cargando } = useAuth()

  if (cargando) return <Cargando />
  if (!session) return <Navigate to="/login" replace />
  if (!perfil || !perfil.activo) return <PerfilBloqueado sinPerfil={!perfil} />
  if (roles && !roles.includes(rol)) return <Navigate to="/no-autorizado" replace />

  return <Outlet />
}
