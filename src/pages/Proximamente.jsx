import Icon from '../components/ui/Icon'

export default function Proximamente({ modulo }) {
  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-brand-tech">
        <Icon name="config" className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-bold text-ink">{modulo}</h2>
      <p className="mt-1 text-sm text-slate-500">Este módulo está en construcción y se habilitará en una fase posterior.</p>
    </div>
  )
}
