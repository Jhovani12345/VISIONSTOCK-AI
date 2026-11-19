import { t } from '../../i18n'

const ESTADOS = {
  DISPONIBLE: { texto: 'Disponible', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', punto: 'bg-brand-ia' },
  STOCK_BAJO: { texto: 'Stock bajo', clase: 'bg-amber-50 text-amber-700 ring-amber-200', punto: 'bg-warn' },
  AGOTADO: { texto: 'Agotado', clase: 'bg-red-50 text-red-700 ring-red-200', punto: 'bg-danger' },
  COMPLETADO: { texto: 'Completado', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', punto: 'bg-brand-ia' },
  ACTIVO: { texto: 'Activo', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', punto: 'bg-brand-ia' },
  INACTIVO: { texto: 'Inactivo', clase: 'bg-slate-100 text-slate-600 ring-slate-200', punto: 'bg-slate-400' },
  BAJA: { texto: 'Baja', clase: 'bg-slate-100 text-slate-600 ring-slate-200', punto: 'bg-slate-400' },
  EN_PROCESO: { texto: 'En proceso', clase: 'bg-sky-50 text-brand-tech ring-sky-200', punto: 'bg-brand-tech' },
  FINALIZADA: { texto: 'Finalizada', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', punto: 'bg-brand-ia' },
  CANCELADA: { texto: 'Cancelada', clase: 'bg-slate-100 text-slate-600 ring-slate-200', punto: 'bg-slate-400' },
  ACTIVA: { texto: 'Activa', clase: 'bg-red-50 text-red-700 ring-red-200', punto: 'bg-danger' },
  ATENDIDA: { texto: 'Atendida', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-200', punto: 'bg-brand-ia' },
}

// Siempre muestra texto además del color.
export default function BadgeEstado({ estado }) {
  const e = ESTADOS[estado] ?? ESTADOS.BAJA
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${e.clase}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${e.punto}`} />
      {ESTADOS[estado] ? t(`estado.${estado}`) : e.texto}
    </span>
  )
}
