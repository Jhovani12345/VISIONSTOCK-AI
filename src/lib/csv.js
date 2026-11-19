// Genera y descarga un CSV compatible con Excel (UTF-8 con BOM).
const celda = (v) => {
  if (v === null || v === undefined) return ''
  const s = String(v)
  // Evita inyección de fórmulas al abrir en Excel
  const seguro = /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro
}

// columnas: [{ titulo, valor: (fila) => any }]
export function aCSV(filas, columnas) {
  const enc = columnas.map((c) => celda(c.titulo)).join(',')
  const cuerpo = filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(','))
  return [enc, ...cuerpo].join('\r\n')
}

export function descargarCSV(nombre, filas, columnas) {
  const blob = new Blob(['﻿' + aCSV(filas, columnas)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Fecha local para nombres de archivo: 2026-11-19
export function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
