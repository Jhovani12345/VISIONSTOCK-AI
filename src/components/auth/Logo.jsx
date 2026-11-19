// Isotipo aproximado en SVG. Para usar el logotipo oficial, reemplaza este componente por <img src="/logo.svg" />.
export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" aria-hidden="true">
        <defs>
          <linearGradient id="vs-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#0e7490" />
          </linearGradient>
        </defs>
        <path d="M3 8 L15 8 L25 31 L20 42 Z" fill="url(#vs-grad)" />
        <path d="M45 8 L33 8 L23 31 L28 42 Z" fill="url(#vs-grad)" opacity="0.85" />
        <path d="M17 12 L24 28 L31 12" fill="none" stroke="#ecfeff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </svg>
      <span className="text-3xl font-bold tracking-tight text-white">
        VisionStock <span className="text-cyan-400">AI</span>
      </span>
    </div>
  )
}
