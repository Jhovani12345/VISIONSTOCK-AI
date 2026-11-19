import { createContext, Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { aplicarPreferencias, guardarLocal, leerLocal, normalizar, PREF_DEFECTO } from '../lib/preferencias'
import { obtenerPreferencias, guardarPreferencias } from '../services/preferencias'
import { setIdioma } from '../i18n'

export const PreferenciasContext = createContext(null)

// Se aplica antes del primer render para evitar parpadeos de tema o idioma.
const inicial = leerLocal()
aplicarPreferencias(inicial)
setIdioma(inicial.idioma)

// Orden de prioridad: preferencias de la cuenta (Supabase) > caché local del equipo > valores por defecto.
export function PreferenciasProvider({ children }) {
  const { user } = useAuth()
  const [pref, setPref] = useState(inicial)
  const prefRef = useRef(pref)
  prefRef.current = pref
  setIdioma(pref.idioma) // antes de renderizar los hijos

  useEffect(() => {
    aplicarPreferencias(pref)
    guardarLocal(pref)
  }, [pref])

  // Tema "sistema": reaccionar si el dispositivo cambia entre claro y oscuro
  useEffect(() => {
    if (pref.tema !== 'sistema' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = () => aplicarPreferencias(prefRef.current)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [pref.tema])

  // Al iniciar sesión se cargan las preferencias de la cuenta; si no tiene, se suben las del equipo.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let cancelado = false
    obtenerPreferencias(userId)
      .then((remotas) => {
        if (cancelado) return
        if (remotas) setPref(normalizar(remotas))
        else return guardarPreferencias(userId, prefRef.current)
      })
      .catch((e) => console.warn('Preferencias: se usan las del equipo.', e.message))
    return () => { cancelado = true }
  }, [userId])

  // Devuelve true si quedó guardado en la cuenta, false si solo en este equipo.
  const cambiar = useCallback(async (cambios) => {
    const nueva = normalizar({ ...prefRef.current, ...cambios })
    prefRef.current = nueva
    setPref(nueva)
    if (!userId) return false
    try {
      await guardarPreferencias(userId, nueva)
      return true
    } catch (e) {
      console.warn('No se pudieron guardar las preferencias en la cuenta.', e.message)
      return false
    }
  }, [userId])

  const restablecer = useCallback(() => cambiar(PREF_DEFECTO), [cambiar])

  const value = useMemo(() => ({ pref, cambiar, restablecer }), [pref, cambiar, restablecer])

  // key = idioma: al cambiarlo se vuelve a montar la app para que todos los textos se traduzcan.
  return (
    <PreferenciasContext.Provider value={value}>
      <Fragment key={pref.idioma}>{children}</Fragment>
    </PreferenciasContext.Provider>
  )
}
