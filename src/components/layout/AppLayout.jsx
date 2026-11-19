import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAlertasActivas } from '../../hooks/useAlertasActivas'
import { ETIQUETA_ROL, ROLES } from '../../lib/constants'
import { NAV, tituloDe } from '../../lib/navegacion'
import Icon from '../ui/Icon'

function iniciales(perfil) {
  const a = (perfil?.nombre ?? '').trim()[0] ?? ''
  const b = (perfil?.apellido ?? '').trim()[0] ?? ''
  return ((a + b) || (perfil?.correo ?? '?')[0]).toUpperCase()
}

export default function AppLayout() {
  const { perfil, rol, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const alertas = useAlertasActivas()
  const [abierto, setAbierto] = useState(false)
  const [menu, setMenu] = useState(false)
  const [busca, setBusca] = useState('')
  const menuRef = useRef(null)

  const items = NAV.filter((i) => i.roles.includes(rol))
  const { titulo, subtitulo } = tituloDe(pathname)

  useEffect(() => {
    if (!menu) return
    const cerrar = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false)
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [menu])

  function buscar(e) {
    e.preventDefault()
    const t = busca.trim()
    navigate(t ? `/inventario?q=${encodeURIComponent(t)}` : '/inventario')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-white font-semibold text-brand shadow-sm' : 'font-medium text-cyan-50/90 hover:bg-white/10'
    }`

  return (
    <div className="min-h-screen bg-surface lg:flex">
      {abierto && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setAbierto(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col bg-brand p-4 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5 px-2 py-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <Icon name="escaner" />
          </span>
          <span className="text-sm font-bold">VisionStock AI</span>
        </Link>

        <nav className="mt-6 flex-1 space-y-0.5 overflow-y-auto" aria-label="Navegación principal">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end className={linkClass} onClick={() => setAbierto(false)}>
              <Icon name={i.icono} />
              {i.etiqueta}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            onClick={() => setAbierto(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight text-ink">{titulo}</h1>
            {subtitulo && <p className="truncate text-xs text-slate-500">{subtitulo}</p>}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <form onSubmit={buscar} role="search" className="relative hidden sm:block">
              <Icon name="buscar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar productos"
                className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-tech focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-tech/30"
              />
            </form>

            <Link
              to={rol === ROLES.SUPER_ADMIN ? '/admin/alertas' : '/inventario'}
              aria-label={`Alertas activas: ${alertas}`}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Icon name="alertas" className="h-5 w-5" />
              {alertas > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />}
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((m) => !m)}
                aria-haspopup="menu"
                aria-expanded={menu}
                aria-label="Menú de usuario"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tech text-xs font-bold text-white"
              >
                {iniciales(perfil)}
              </button>
              {menu && (
                <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">{perfil?.nombre} {perfil?.apellido}</p>
                    <p className="text-xs text-slate-500">{ETIQUETA_ROL[rol]}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Icon name="salir" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
