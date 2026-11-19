const ESTADOS = {
  DISPONIBLE: { texto: 'Disponible', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', punto: 'bg-brand-ia' },
  STOCK_BAJO: { texto: 'Stock bajo', clase: 'bg-amber-50 text-amber-700 ring-amber-200', punto: 'bg-warn' },
  AGOTADO: { texto: 'Agotado', clase: 'bg-red-50 text-red-700 ring-red-200', punto: 'bg-danger' },
  COMPLETADO: { texto: 'Completado', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', punto: 'bg-brand-ia' },
  BAJA: { texto: 'Baja', clase: 'bg-slate-100 text-slate-600 ring-slate-200', punto: 'bg-slate-400' },
}

// Siempre muestra texto además del color.
export default function BadgeEstado({ estado }) {
  const e = ESTADOS[estado] ?? ESTADOS.BAJA
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${e.clase}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${e.punto}`} />
      {e.texto}
    </span>
  )
}
