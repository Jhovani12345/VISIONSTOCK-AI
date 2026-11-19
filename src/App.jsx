import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ROLES, RUTA_INICIO } from './lib/constants'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import Recuperar from './pages/auth/Recuperar'
import Restablecer from './pages/auth/Restablecer'
import NoAutorizado from './pages/NoAutorizado'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import OperativoHome from './pages/operativo/OperativoHome'
import InventarioPage from './pages/inventario/InventarioPage'
import MovimientoPage from './pages/movimientos/MovimientoPage'
import HistorialMovimientos from './pages/movimientos/HistorialMovimientos'
import AuditoriasPage from './pages/auditorias/AuditoriasPage'
import AuditoriaDetalle from './pages/auditorias/AuditoriaDetalle'
import AlertasPage from './pages/alertas/AlertasPage'
import AnalisisPage from './pages/analisis/AnalisisPage'
import ReportesPage from './pages/reportes/ReportesPage'
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage'

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
        <Route path="/recuperar" element={<Recuperar />} />
      </Route>

      {/* Pública: llega con sesión de recuperación */}
      <Route path="/restablecer" element={<Restablecer />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RedirigirPorRol />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Solo SUPER_ADMIN */}
          <Route element={<ProtectedRoute roles={SOLO_ADMIN} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/productos" element={<InventarioPage modoAdmin />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/auditorias" element={<AuditoriasPage />} />
            <Route path="/admin/auditorias/:id" element={<AuditoriaDetalle />} />
            <Route path="/admin/alertas" element={<AlertasPage />} />
            <Route path="/admin/analisis" element={<AnalisisPage />} />
            <Route path="/admin/reportes" element={<ReportesPage />} />
            <Route path="/admin/configuracion" element={<ConfiguracionPage />} />
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
