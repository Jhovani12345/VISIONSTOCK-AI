import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Cargando from '../components/ui/Cargando'
import { RUTA_INICIO } from '../lib/constants'

// Login y registro: si ya hay sesión válida, redirige al inicio del rol.
export default function GuestRoute() {
  const { session, perfil, rol, cargando } = useAuth()

  if (cargando) return <Cargando />
  if (session && perfil?.activo) return <Navigate to={RUTA_INICIO[rol] ?? '/'} replace />

  return <Outlet />
}
