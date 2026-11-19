import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
        <p className="text-4xl font-bold text-brand">404</p>
        <h1 className="mt-2 text-xl font-bold text-ink">Página no encontrada</h1>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-brand-tech hover:underline">
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
