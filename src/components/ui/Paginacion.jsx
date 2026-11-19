import Button from './Button'
import { t } from '../../i18n'

export default function Paginacion({ pagina, porPagina, total, onCambiar }) {
  const paginas = Math.max(1, Math.ceil(total / porPagina))
  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1
  const hasta = Math.min(pagina * porPagina, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        {t('pag.mostrando', { desde, hasta, total })}
      </p>
      <div className="flex items-center gap-2">
        <Button variante="suave" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
          {t('pag.anterior')}
        </Button>
        <span className="px-2 text-sm text-slate-600">
          {pagina} / {paginas}
        </span>
        <Button variante="suave" disabled={pagina >= paginas} onClick={() => onCambiar(pagina + 1)}>
          {t('pag.siguiente')}
        </Button>
      </div>
    </div>
  )
}
