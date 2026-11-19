export default function AuthShell({ titulo, subtitulo, children, pie }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
            VS
          </div>
          <h1 className="text-2xl font-bold text-brand">VisionStock AI</h1>
          <p className="text-sm text-slate-500">Gestión inteligente de inventarios</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-xl font-bold text-ink">{titulo}</h2>
          {subtitulo && <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {pie && <p className="mt-4 text-center text-sm text-slate-600">{pie}</p>}
      </div>
    </main>
  )
}
