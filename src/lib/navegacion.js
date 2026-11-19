import { ROLES } from './constants'

const ADMIN = [ROLES.SUPER_ADMIN]
const TRABAJADOR = [ROLES.TRABAJADOR_ALMACEN]
const AMBOS = [ROLES.SUPER_ADMIN, ROLES.TRABAJADOR_ALMACEN]

// Menú lateral (orden igual al prototipo de alta fidelidad)
export const NAV = [
  { to: '/admin', etiqueta: 'Dashboard', icono: 'dashboard', roles: ADMIN, subtitulo: 'Resumen general de tu inventario' },
  { to: '/operativo', etiqueta: 'Inicio', icono: 'inicio', roles: TRABAJADOR, subtitulo: 'Vista operativa de almacén' },
  { to: '/inventario', etiqueta: 'Inventario', icono: 'inventario', roles: AMBOS, subtitulo: 'Consulta las existencias disponibles' },
  { to: '/admin/productos', etiqueta: 'Productos', icono: 'productos', roles: ADMIN, subtitulo: 'Administra el catálogo de productos' },
  { to: '/entradas', etiqueta: 'Entradas', icono: 'entradas', roles: AMBOS, subtitulo: 'Registra la mercancía que ingresa al almacén' },
  { to: '/salidas', etiqueta: 'Salidas', icono: 'salidas', roles: AMBOS, subtitulo: 'Registra la mercancía que sale del almacén' },
  { to: '/admin/auditorias', etiqueta: 'Auditorías', icono: 'auditorias', roles: ADMIN, subtitulo: 'Compara el inventario del sistema con el físico' },
  { to: '/admin/alertas', etiqueta: 'Alertas', icono: 'alertas', roles: ADMIN, subtitulo: 'Productos con stock bajo o agotado' },
  { to: '/admin/analisis', etiqueta: 'Análisis', icono: 'analisis', roles: ADMIN, subtitulo: 'Consumo y predicciones del inventario' },
  { to: '/admin/reportes', etiqueta: 'Reportes', icono: 'reportes', roles: ADMIN, subtitulo: 'Información de productos, movimientos y auditorías' },
  { to: '/admin/usuarios', etiqueta: 'Usuarios', icono: 'usuarios', roles: ADMIN, subtitulo: 'Gestiona usuarios y roles' },
  { to: '/admin/configuracion', etiqueta: 'Configuración', icono: 'config', roles: ADMIN, subtitulo: 'Ajustes generales del sistema' },
]

// Rutas que no aparecen en el menú pero sí tienen título
const EXTRAS = [
  { to: '/movimientos', etiqueta: 'Movimientos', subtitulo: 'Historial de entradas y salidas' },
  { to: '/no-autorizado', etiqueta: 'Acceso no autorizado', subtitulo: '' },
]

export function tituloDe(pathname) {
  const n = [...NAV, ...EXTRAS].find((i) => i.to === pathname)
  return { titulo: n?.etiqueta ?? 'VisionStock AI', subtitulo: n?.subtitulo ?? '' }
}
