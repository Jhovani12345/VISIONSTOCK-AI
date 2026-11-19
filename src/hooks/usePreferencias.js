import { useContext } from 'react'
import { PreferenciasContext } from '../context/PreferenciasContext'

export function usePreferencias() {
  const ctx = useContext(PreferenciasContext)
  if (!ctx) throw new Error('usePreferencias debe usarse dentro de <PreferenciasProvider>')
  return ctx
}
