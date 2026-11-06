import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import SidebarLayout from './components/SidebarLayout';
import DashboardPage from './pages/DashboardPage';
import UserManagement from './pages/UserManagement';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-sm text-slate-500">Cargando permisos...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile?.rol)) {
    return <div className="p-6 text-brand-danger font-semibold">Acceso no autorizado para tu rol ({profile?.rol}).</div>;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}

function MainApp() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/admin/dashboard" replace />} />
        
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMINISTRADOR']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMINISTRADOR']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={user ? "/admin/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}