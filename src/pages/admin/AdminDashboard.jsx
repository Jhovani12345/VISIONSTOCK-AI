import { useAuth } from '../../hooks/useAuth'
import { ETIQUETA_ROL } from '../../lib/constants'

// Placeholder: se reemplaza por KPIs reales en la Fase 7.
export default function AdminDashboard() {
  const { perfil, rol } = useAuth()
  return (
    <section>
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Sesión iniciada correctamente.</p>
      <dl className="mt-6 grid max-w-xl gap-3 rounded-2xl bg-white p-6 text-sm ring-1 ring-slate-200 sm:grid-cols-2">
        <div><dt className="text-slate-500">Nombre</dt><dd className="font-semibold">{perfil.nombre} {perfil.apellido}</dd></div>
        <div><dt className="text-slate-500">Correo</dt><dd className="font-semibold">{perfil.correo}</dd></div>
        <div><dt className="text-slate-500">Rol</dt><dd className="font-semibold">{ETIQUETA_ROL[rol]}</dd></div>
      </dl>
    </section>
  )
}
