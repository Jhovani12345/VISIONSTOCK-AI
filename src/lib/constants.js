export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TRABAJADOR_ALMACEN: 'TRABAJADOR_ALMACEN',
}

export const ETIQUETA_ROL = {
  SUPER_ADMIN: 'Super administrador',
  TRABAJADOR_ALMACEN: 'Trabajador de almacén',
}

// Ruta de inicio según el rol
export const RUTA_INICIO = {
  SUPER_ADMIN: '/admin',
  TRABAJADOR_ALMACEN: '/operativo',
}

export const ESTADO_STOCK = {
  DISPONIBLE: 'DISPONIBLE',
  STOCK_BAJO: 'STOCK_BAJO',
  AGOTADO: 'AGOTADO',
}
