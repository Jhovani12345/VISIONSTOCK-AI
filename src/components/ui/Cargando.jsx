import { t } from '../../i18n'

export default function Cargando({ texto = t('comun.cargando') }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" role="status">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-tech" />
        {texto}
      </div>
    </div>
  )
}
