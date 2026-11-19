// Edge Function: crear-usuario
// Solo un SUPER_ADMIN activo puede invocarla. Usa la service_role key (nunca va al navegador).
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const ROLES_VALIDOS = ['SUPER_ADMIN', 'TRABAJADOR_ALMACEN']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1. ¿Quién llama?
    const caller = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user }, error: errAuth } = await caller.auth.getUser()
    if (errAuth || !user) return json({ error: 'No autenticado.' }, 401)

    // 2. ¿Es SUPER_ADMIN activo?
    const admin = createClient(url, service)
    const { data: perfil } = await admin
      .from('perfil').select('activo, rol(nombre_rol)').eq('id', user.id).maybeSingle()
    // deno-lint-ignore no-explicit-any
    if (!perfil?.activo || (perfil.rol as any)?.nombre_rol !== 'SUPER_ADMIN') {
      return json({ error: 'No tienes permisos para crear usuarios.' }, 403)
    }

    // 3. Validar entrada
    const body = await req.json().catch(() => null)
    const correo = String(body?.correo ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')
    const nombre = String(body?.nombre ?? '').trim()
    const apellido = String(body?.apellido ?? '').trim()
    const rol = String(body?.rol ?? 'TRABAJADOR_ALMACEN')

    if (!nombre) return json({ error: 'El nombre es obligatorio.' }, 400)
    if (!/^\S+@\S+\.\S+$/.test(correo)) return json({ error: 'Correo no válido.' }, 400)
    if (password.length < 8) return json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400)
    if (!ROLES_VALIDOS.includes(rol)) return json({ error: 'Rol no válido.' }, 400)

    // 4. Crear en Auth (el trigger handle_new_user crea el perfil como TRABAJADOR_ALMACEN)
    const { data: creado, error: errCrear } = await admin.auth.admin.createUser({
      email: correo,
      password,
      email_confirm: true,
      user_metadata: { nombre, apellido },
    })
    if (errCrear || !creado?.user) {
      const duplicado = /already|registered|exists/i.test(errCrear?.message ?? '')
      return json({ error: duplicado ? 'Ya existe un usuario con ese correo.' : 'No se pudo crear el usuario.' }, duplicado ? 409 : 400)
    }

    // 5. Rol solicitado distinto al por defecto
    if (rol === 'SUPER_ADMIN') {
      const { data: r } = await admin.from('rol').select('id_rol').eq('nombre_rol', 'SUPER_ADMIN').single()
      const { error: errRol } = await admin.from('perfil').update({ id_rol: r?.id_rol }).eq('id', creado.user.id)
      if (errRol) return json({ error: 'Usuario creado, pero no se pudo asignar el rol. Edítalo desde la lista.' }, 500)
    }

    return json({ ok: true, id: creado.user.id })
  } catch (_e) {
    return json({ error: 'Error inesperado en el servidor.' }, 500)
  }
})
