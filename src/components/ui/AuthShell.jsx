import FondoAuth from '../auth/FondoAuth'
import Logo from '../auth/Logo'

export default function AuthShell({ titulo, subtitulo, children, pie, logo = true }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <FondoAuth />
      <main className="relative z-10 w-full max-w-md py-8">
        {logo && <Logo className="mb-8" />}
        <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/55 p-6 shadow-[0_0_48px_rgba(34,211,238,0.14)] backdrop-blur-xl sm:p-8">
          <h1 className="text-center text-3xl font-bold text-white">{titulo}</h1>
          {subtitulo && <p className="mt-2 text-center text-sm text-slate-300">{subtitulo}</p>}
          <div className="mt-7">{children}</div>
          {pie && <div className="mt-6 text-center text-sm text-slate-300">{pie}</div>}
        </div>
      </main>
    </div>
  )
}
