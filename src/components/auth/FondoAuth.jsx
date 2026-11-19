// Fondo oscuro con brillos y cubos isométricos en SVG.
// Para usar el arte exacto del prototipo, exporta el fondo como public/auth-bg.webp (se superpone automáticamente).
function Cubo({ x, y, s, o = 0.35 }) {
  const w = s * 0.866
  const h = s / 2
  const P = { t: [x, y - s], rt: [x + w, y - h], rb: [x + w, y + h], b: [x, y + s], lb: [x - w, y + h], lt: [x - w, y - h], c: [x, y] }
  const pts = (...k) => k.map((n) => P[n].join(',')).join(' ')
  return (
    <g opacity={o} stroke="#22d3ee" strokeWidth="1.2" strokeLinejoin="round" fill="none">
      <polygon points={pts('t', 'rt', 'c', 'lt')} fill="rgba(34,211,238,0.10)" />
      <polygon points={pts('t', 'rt', 'rb', 'b', 'lb', 'lt')} />
      <polyline points={pts('lt', 'c', 'rt')} />
      <line x1={x} y1={y} x2={x} y2={y + s} />
    </g>
  )
}

const NODOS = [[120, 560], [210, 610], [180, 700], [300, 660], [90, 760]]

export default function FondoAuth() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050d18]" aria-hidden="true">
      <div className="absolute inset-0 bg-[url('/auth-bg.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,116,144,0.35),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_92%,rgba(34,211,238,0.20),transparent_45%)]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="puntos" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#22d3ee" opacity="0.35" />
          </pattern>
        </defs>
        <rect x="900" y="0" width="540" height="280" fill="url(#puntos)" opacity="0.5" />

        <Cubo x={1250} y={170} s={72} o={0.45} />
        <Cubo x={1160} y={255} s={52} o={0.3} />
        <Cubo x={1340} y={265} s={46} o={0.3} />
        <Cubo x={1240} y={720} s={62} o={0.35} />
        <Cubo x={1340} y={800} s={44} o={0.25} />
        <Cubo x={170} y={720} s={74} o={0.4} />
        <Cubo x={90} y={640} s={42} o={0.28} />
        <Cubo x={260} y={810} s={42} o={0.25} />
        <Cubo x={130} y={150} s={38} o={0.2} />

        <g stroke="#22d3ee" strokeWidth="1" opacity="0.3" fill="none">
          <polyline points={NODOS.map((n) => n.join(',')).join(' ')} />
          <line x1="120" y1="560" x2="180" y2="700" />
        </g>
        {NODOS.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#22d3ee" opacity="0.5" />)}
      </svg>
    </div>
  )
}
