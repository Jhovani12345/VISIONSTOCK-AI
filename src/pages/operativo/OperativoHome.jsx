import { useAuth } from '../../hooks/useAuth'

// Placeholder: entradas, salidas y consulta de stock en las Fases 4 y 5.
export default function OperativoHome() {
  const { perfil } = useAuth()
  return (
    <section>
      <h1 className="text-2xl font-bold text-ink">Hola, {perfil.nombre}</h1>
      <p className="mt-1 text-sm text-slate-500">Vista operativa de almacén.</p>
    </section>
  )
}
