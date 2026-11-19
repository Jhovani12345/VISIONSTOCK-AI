import { Link } from 'react-router-dom'

export default function NoAutorizado() {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
      <p className="text-4xl font-bold text-danger">403</p>
      <h1 className="mt-2 text-xl font-bold text-ink">Acceso no autorizado</h1>
      <p className="mt-1 text-sm text-slate-500">No tienes permisos para ver esta sección.</p>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-brand-tech hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
