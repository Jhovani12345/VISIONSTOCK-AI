import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardCheck,
  Bell,
  TrendingUp,
  FileText,
  Users,
  Settings,
  LogOut,
  Search
} from 'lucide-react';

export default function SidebarLayout({ children }) {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Inventario', path: '/admin/inventario', icon: Boxes },
    { label: 'Productos', path: '/admin/productos', icon: Package },
    { label: 'Entradas', path: '/admin/entradas', icon: ArrowDownLeft },
    { label: 'Salidas', path: '/admin/salidas', icon: ArrowUpRight },
    { label: 'Auditorías', path: '/admin/auditorias', icon: ClipboardCheck },
    { label: 'Alertas', path: '/admin/alertas', icon: Bell },
    { label: 'Análisis', path: '/admin/analisis', icon: TrendingUp },
    { label: 'Reportes', path: '/admin/reportes', icon: FileText },
    { label: 'Usuarios', path: '/admin/usuarios', icon: Users },
    { label: 'Configuración', path: '/admin/configuracion', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* 1. Menú Lateral Fijo (Sidebar) */}
      <aside className="w-64 bg-[#155E75] text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-cyan-800/40">
            <div className="w-8 h-8 bg-[#0284C7] rounded-lg flex items-center justify-center font-bold text-white shadow">
              VS
            </div>
            <span className="font-bold text-lg tracking-wide">VisionStock AI</span>
          </div>

          {/* Opciones de Navegación */}
          <nav className="mt-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#155E75] font-semibold shadow-sm'
                      : 'text-cyan-100 hover:bg-cyan-800/40 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#155E75]' : 'text-cyan-200'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Botón Cerrar Sesión en Sidebar */}
        <div className="p-4 border-t border-cyan-800/40">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-cyan-100 hover:bg-red-500/20 hover:text-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* 2. Área Principal de Contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Superior */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between shrink-0 shadow-sm">
          {/* Buscador Rápido Global */}
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0284C7] transition"
            />
          </div>

          {/* Perfil del Usuario */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {profile?.nombre?.[0]}{profile?.apellido?.[0]}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#0F172A]">{profile?.nombre} {profile?.apellido}</div>
              <div className="text-[10px] text-[#0284C7] font-semibold">{profile?.rol}</div>
            </div>
          </div>
        </header>

        {/* Pantalla Dinámica */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}