/** @type {import('tailwindcss').Config} */

// Los colores se leen de variables CSS (src/index.css) para que el modo oscuro
// y el color de acento elegido por el usuario apliquen a toda la app.
const v = (nombre) => `rgb(var(${nombre}) / <alpha-value>)`
const escala = (color, tonos) => Object.fromEntries(tonos.map((t) => [t, v(`--${color}-${t}`)]))
const TINTES = [50, 100, 200, 700, 800]

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--fuente)', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: v('--brand'), tech: v('--brand-tech'), ia: v('--brand-ia') },
        ink: v('--ink'),
        surface: v('--surface'),
        warn: '#F59E0B',
        danger: '#EF4444',
        slate: escala('slate', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        emerald: escala('emerald', TINTES),
        sky: escala('sky', TINTES),
        red: escala('red', TINTES),
        amber: escala('amber', TINTES),
        cyan: escala('cyan', TINTES),
      },
    },
  },
  plugins: [],
}
