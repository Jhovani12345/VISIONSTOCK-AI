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
import Proximamente from './pages/Proximamente'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import OperativoHome from './pages/operativo/OperativoHome'
import InventarioPage from './pages/inventario/InventarioPage'
import MovimientoPage from './pages/movimientos/MovimientoPage'
import HistorialMovimientos from './pages/movimientos/HistorialMovimientos'

const SOLO_ADMIN = [ROLES.SUPER_ADMIN]
const AMBOS = [ROLES.SUPER_ADMIN, ROLES.TRABAJADOR_ALMACEN]

function RedirigirPorRol() {
  const { rol } = useAuth()
  return <Navigate to={RUTA_INICIO[rol] ?? '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RedirigirPorRol />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Solo SUPER_ADMIN */}
          <Route element={<ProtectedRoute roles={SOLO_ADMIN} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/productos" element={<InventarioPage modoAdmin />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/auditorias" element={<Proximamente modulo="Auditorías" />} />
            <Route path="/admin/alertas" element={<Proximamente modulo="Alertas" />} />
            <Route path="/admin/analisis" element={<Proximamente modulo="Análisis" />} />
            <Route path="/admin/reportes" element={<Proximamente modulo="Reportes" />} />
            <Route path="/admin/configuracion" element={<Proximamente modulo="Configuración" />} />
          </Route>

          {/* Administrador y trabajador de almacén */}
          <Route element={<ProtectedRoute roles={AMBOS} />}>
            <Route path="/operativo" element={<OperativoHome />} />
            <Route path="/inventario" element={<InventarioPage />} />
            <Route path="/entradas" element={<MovimientoPage key="ENTRADA" tipo="ENTRADA" />} />
            <Route path="/salidas" element={<MovimientoPage key="SALIDA" tipo="SALIDA" />} />
            <Route path="/movimientos" element={<HistorialMovimientos />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
