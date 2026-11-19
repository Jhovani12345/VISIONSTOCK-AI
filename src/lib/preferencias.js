// Preferencias de interfaz: catálogo de opciones, aplicación al documento y caché local.

export const COLORES = {
  cian: { brand: '21 94 117', tech: '2 132 199', soft: '103 232 249' },
  azul: { brand: '30 58 138', tech: '37 99 235', soft: '147 197 253' },
  indigo: { brand: '55 48 163', tech: '79 70 229', soft: '165 180 252' },
  violeta: { brand: '91 33 182', tech: '124 58 237', soft: '196 181 253' },
  verde: { brand: '6 95 70', tech: '5 150 105', soft: '110 231 183' },
  rosa: { brand: '159 18 57', tech: '225 29 72', soft: '253 164 175' },
  naranja: { brand: '154 52 18', tech: '234 88 12', soft: '253 186 116' },
  grafito: { brand: '30 41 59', tech: '71 85 105', soft: '203 213 225' },
}

// familia: valor CSS; google: parámetro de Google Fonts (null = fuente del sistema)
export const TIPOGRAFIAS = {
  inter: { nombre: 'Inter', familia: "'Inter'", google: 'Inter:wght@400;500;600;700' },
  roboto: { nombre: 'Roboto', familia: "'Roboto'", google: 'Roboto:wght@400;500;700' },
  poppins: { nombre: 'Poppins', familia: "'Poppins'", google: 'Poppins:wght@400;500;600;700' },
  nunito: { nombre: 'Nunito', familia: "'Nunito'", google: 'Nunito:wght@400;500;600;700' },
  source: { nombre: 'Source Sans 3', familia: "'Source Sans 3'", google: 'Source+Sans+3:wght@400;500;600;700' },
  sistema: { nombre: 'Sistema', familia: 'system-ui', google: null },
}

export const TAMANOS = { pequeno: '14px', normal: '16px', grande: '18px' }

export const PREF_DEFECTO = { tema: 'claro', idioma: 'es', tipografia: 'inter', tamano: 'normal', color: 'cian' }

const CLAVE = 'visionstock-preferencias'

// Descarta valores desconocidos (p. ej. de una versión anterior)
export function normalizar(p = {}) {
  const ok = (valor, permitidos, def) => (permitidos.includes(valor) ? valor : def)
  return {
    tema: ok(p.tema, ['claro', 'oscuro', 'sistema'], PREF_DEFECTO.tema),
    idioma: ok(p.idioma, ['es', 'en'], PREF_DEFECTO.idioma),
    tipografia: ok(p.tipografia, Object.keys(TIPOGRAFIAS), PREF_DEFECTO.tipografia),
    tamano: ok(p.tamano, Object.keys(TAMANOS), PREF_DEFECTO.tamano),
    color: ok(p.color, Object.keys(COLORES), PREF_DEFECTO.color),
  }
}

export function leerLocal() {
  try {
    return normalizar(JSON.parse(localStorage.getItem(CLAVE) ?? '{}'))
  } catch {
    return { ...PREF_DEFECTO }
  }
}

export function guardarLocal(p) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p))
  } catch { /* almacenamiento bloqueado: se usa solo la base de datos */ }
}

export const sistemaOscuro = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

function cargarFuente(clave) {
  const t = TIPOGRAFIAS[clave]
  if (!t?.google) return
  const id = `fuente-${clave}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${t.google}&display=swap`
  document.head.appendChild(link)
}

export function aplicarPreferencias(p) {
  const root = document.documentElement
  const c = COLORES[p.color]
  const t = TIPOGRAFIAS[p.tipografia]
  root.style.setProperty('--brand', c.brand)
  root.style.setProperty('--brand-tech', c.tech)
  root.style.setProperty('--brand-soft', c.soft)
  root.style.setProperty('--fuente', t.familia)
  root.style.setProperty('--tam-base', TAMANOS[p.tamano])
  root.classList.toggle('dark', p.tema === 'oscuro' || (p.tema === 'sistema' && sistemaOscuro()))
  root.lang = p.idioma
  cargarFuente(p.tipografia)
}
