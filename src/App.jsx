import { useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from './lib/supabase'

// Pantalla temporal de la Fase 1: verifica entorno y conexión con Supabase.
// Se reemplaza por el enrutador real en la Fase 2.
export default function App() {
  const [estado, setEstado] = useState('verificando')

  useEffect(() => {
    if (!supabaseConfigurado) return setEstado('sin-env')
    supabase.auth
      .getSession()
      .then(({ error }) => setEstado(error ? 'error' : 'ok'))
      .catch(() => setEstado('error'))
  }, [])

  const mensajes = {
    verificando: ['Verificando conexión…', 'text-slate-500'],
    ok: ['Conectado a Supabase', 'text-brand-ia'],
    error: ['No se pudo conectar con Supabase', 'text-danger'],
    'sin-env': ['Faltan las variables VITE_SUPABASE_* en .env', 'text-warn'],
  }
  const [texto, color] = mensajes[estado]

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-center">
        <h1 className="text-3xl font-bold text-brand">VisionStock AI</h1>
        <p className="mt-1 text-sm text-slate-500">Gestión inteligente de inventarios</p>
        <p className={`mt-6 text-sm font-semibold ${color}`}>{texto}</p>
      </div>
    </main>
  )
}
