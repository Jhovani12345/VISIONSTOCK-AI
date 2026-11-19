import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Cuenta de alertas activas para el punto rojo de la campana (se refresca al navegar).
export function useAlertasActivas() {
  const { pathname } = useLocation()
  const [n, setN] = useState(0)
  useEffect(() => {
    let cancelado = false
    supabase
      .from('alerta')
      .select('id_alerta', { count: 'exact', head: true })
      .eq('estado', 'ACTIVA')
      .then(({ count }) => !cancelado && setN(count ?? 0))
    return () => { cancelado = true }
  }, [pathname])
  return n
}
