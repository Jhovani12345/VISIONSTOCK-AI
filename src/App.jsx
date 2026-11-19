import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ROLES, RUTA_INICIO } from './lib/constants'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import NoAutorizado from './pages/NoAutorizado'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import OperativoHome from './pages/operativo/OperativoHome'
import InventarioPage from './pages/inventario/InventarioPage'

function RedirigirPorRol() {
  const { rol } = useAuth()
  return <Navigate to={RUTA_INICIO[rol] ?? '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Públicas (si ya hay sesión, redirigen al inicio del rol) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      {/* Requieren sesión */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RedirigirPorRol />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Solo SUPER_ADMIN */}
          <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/productos" element={<InventarioPage modoAdmin />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          </Route>

          {/* Operativo: trabajador de almacén y admin */}
          <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.TRABAJADOR_ALMACEN]} />}>
            <Route path="/operativo" element={<OperativoHome />} />
            <Route path="/inventario" element={<InventarioPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
