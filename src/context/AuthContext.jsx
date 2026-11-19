import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ROLES } from '../lib/constants'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = todavía no sabemos si hay sesión
  const [session, setSession] = useState(undefined)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  const sesionLista = session !== undefined
  const userId = session?.user?.id

  // 1. Sesión (inicial + cambios). No se hacen consultas dentro del callback.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSession(nueva ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  // 2. Perfil + rol, solo cuando cambia el usuario (no en cada refresh de token)
  useEffect(() => {
    if (!sesionLista) return
    if (!userId) {
      setPerfil(null)
      setCargando(false)
      return
    }
    let cancelado = false
    setCargando(true)
    supabase
      .from('perfil')
      .select('id, nombre, apellido, correo, activo, rol(nombre_rol)')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) console.error('Error al cargar el perfil:', error)
        setPerfil(data ?? null)
        setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [sesionLista, userId])

  const signIn = useCallback(
    (correo, password) => supabase.auth.signInWithPassword({ email: correo, password }),
    []
  )

  const signUp = useCallback(
    (correo, password, nombre, apellido) =>
      supabase.auth.signUp({
        email: correo,
        password,
        options: { data: { nombre, apellido } },
      }),
    []
  )

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  const value = useMemo(() => {
    const rol = perfil?.rol?.nombre_rol ?? null
    return {
      session,
      user: session?.user ?? null,
      perfil,
      rol,
      esAdmin: rol === ROLES.SUPER_ADMIN,
      cargando,
      signIn,
      signUp,
      signOut,
    }
  }, [session, perfil, cargando, signIn, signUp, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
