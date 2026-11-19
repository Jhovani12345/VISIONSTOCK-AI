import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLES, ETIQUETA_ROL } from '../../lib/constants'

const NAV = [
  { to: '/admin', label: 'Dashboard', roles: [ROLES.SUPER_ADMIN], end: true },
  { to: '/admin/productos', label: 'Productos', roles: [ROLES.SUPER_ADMIN] },
  { to: '/inventario', label: 'Inventario', roles: [ROLES.SUPER_ADMIN, ROLES.TRABAJADOR_ALMACEN] },
  { to: '/admin/usuarios', label: 'Usuarios', roles: [ROLES.SUPER_ADMIN] },
  { to: '/operativo', label: 'Operación', roles: [ROLES.SUPER_ADMIN, ROLES.TRABAJADOR_ALMACEN] },
]

export default function AppLayout() {
  const { perfil, rol, signOut } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const items = NAV.filter((i) => i.roles.includes(rol))

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-white text-brand' : 'text-cyan-50 hover:bg-white/10'
    }`

  return (
    <div className="min-h-screen lg:flex">
      {abierto && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setAbierto(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-brand p-4 text-white transition-transform lg:static lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-3 py-2 text-lg font-bold">VisionStock AI</div>
        <nav className="mt-6 space-y-1" aria-label="Navegación principal">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className={linkClass} onClick={() => setAbierto(false)}>
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button
            onClick={() => setAbierto(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">
                {perfil?.nombre} {perfil?.apellido}
              </p>
              <p className="text-xs text-slate-500">{ETIQUETA_ROL[rol]}</p>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
