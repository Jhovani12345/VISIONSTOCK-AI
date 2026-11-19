import { useCallback, useEffect, useState } from 'react'
import { actualizarUsuario, crearUsuario, listarRoles, listarUsuarios } from '../../services/usuarios'
import { traducirErrorDB } from '../../lib/errores'
import { ETIQUETA_ROL, ROLES } from '../../lib/constants'
import { fmtFechaLarga } from '../../lib/formato'
import { useAuth } from '../../hooks/useAuth'
import { useDebounce } from '../../hooks/useDebounce'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Paginacion from '../../components/ui/Paginacion'
import UsuarioForm from './UsuarioForm'

const POR_PAGINA = 10
const SELECT_CLASE =
  'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-tech focus:outline-none focus:ring-2 focus:ring-brand-tech/30'

const iniciales = (u) => ((u.nombre?.[0] ?? '') + (u.apellido?.[0] ?? '') || u.correo[0]).toUpperCase()

function BadgeRol({ rol }) {
  const admin = rol === ROLES.SUPER_ADMIN
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${admin ? 'bg-sky-50 text-brand-tech ring-sky-200' : 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {ETIQUETA_ROL[rol] ?? rol}
    </span>
  )
}

export default function AdminUsuarios() {
  const { user } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [rolF, setRolF] = useState('TODOS')
  const [estadoF, setEstadoF] = useState('TODOS')
  const [pagina, setPagina] = useState(1)
  const [datos, setDatos] = useState({ filas: [], total: 0 })
  const [roles, setRoles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [modal, setModal] = useState(null) // { tipo: 'form' | 'estado', usuario? }
  const [procesando, setProcesando] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const q = useDebounce(busqueda)

  useEffect(() => {
    listarRoles().then(setRoles).catch((e) => setError(traducirErrorDB(e)))
  }, [])

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setError('')
    listarUsuarios({ busqueda: q, rol: rolF, estado: estadoF, pagina, porPagina: POR_PAGINA })
      .then((r) => {
        if (cancelado) return
        const paginas = Math.max(1, Math.ceil(r.total / POR_PAGINA))
        if (pagina > paginas) return setPagina(paginas)
        setDatos(r)
      })
      .catch((e) => !cancelado && setError(traducirErrorDB(e)))
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [q, rolF, estadoF, pagina, recarga])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 4000)
    return () => clearTimeout(t)
  }, [aviso])

  const cerrar = useCallback(() => setModal(null), [])
  const recargar = () => setRecarga((n) => n + 1)

  async function guardar(p, usuario) {
    if (usuario) {
      const rol = roles.find((r) => r.nombre_rol === p.rol)
      if (!rol) throw Object.assign(new Error('No se pudieron cargar los roles. Recarga la página.'), { code: 'P0001' })
      await actualizarUsuario(usuario.id, { nombre: p.nombre, apellido: p.apellido, id_rol: rol.id_rol })
      setAviso('Usuario actualizado.')
    } else {
      await crearUsuario(p)
      setAviso('Usuario creado correctamente.')
    }
    setModal(null)
    recargar()
  }

  async function confirmarEstado() {
    const u = modal.usuario
    setProcesando(true)
    try {
      await actualizarUsuario(u.id, { activo: !u.activo })
      setAviso(u.activo ? 'Usuario desactivado.' : 'Usuario activado.')
      recargar()
    } catch (e) {
      setError(traducirErrorDB(e))
    } finally {
      setProcesando(false)
      setModal(null)
    }
  }

  const { filas, total } = datos
  const hayFiltros = busqueda || rolF !== 'TODOS' || estadoF !== 'TODOS'

  return (
    <section>
      <div className="flex justify-end">
        <Button onClick={() => setModal({ tipo: 'form' })}>+ Nuevo usuario</Button>
      </div>

      <div className="mt-4 space-y-3">
        {aviso && <Alert tipo="exito">{aviso}</Alert>}
        {error && <Alert tipo="error">{error}</Alert>}

        <div className="flex flex-wrap gap-3">
          <input
            type="search" aria-label="Buscar usuarios" placeholder="Buscar por nombre o correo"
            value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
            className={`${SELECT_CLASE} min-w-[220px] flex-1 placeholder:text-slate-400`}
          />
          <select aria-label="Filtrar por rol" value={rolF} onChange={(e) => { setRolF(e.target.value); setPagina(1) }} className={SELECT_CLASE}>
            <option value="TODOS">Todos los roles</option>
            {Object.values(ROLES).map((r) => <option key={r} value={r}>{ETIQUETA_ROL[r]}</option>)}
          </select>
          <select aria-label="Filtrar por estado" value={estadoF} onChange={(e) => { setEstadoF(e.target.value); setPagina(1) }} className={SELECT_CLASE}>
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        </div>
      </div>

      <div className={`mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity ${cargando ? 'opacity-60' : ''}`} aria-busy={cargando}>
        {filas.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {cargando ? 'Cargando…' : hayFiltros ? 'Ningún usuario coincide con los filtros.' : 'Aún no hay usuarios.'}
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Registro</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.map((u) => {
                const propio = u.id === user?.id
                return (
                  <tr key={u.id} className={u.activo ? '' : 'bg-slate-50/60 text-slate-500'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-brand-tech">{iniciales(u)}</span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {u.nombre} {u.apellido}
                            {propio && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">Tú</span>}
                          </p>
                          <p className="truncate text-xs text-slate-500">{u.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><BadgeRol rol={u.rol?.nombre_rol} /></td>
                    <td className="px-4 py-3"><BadgeEstado estado={u.activo ? 'ACTIVO' : 'INACTIVO'} /></td>
                    <td className="px-4 py-3 text-slate-500">{fmtFechaLarga(u.fecha_registro)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setModal({ tipo: 'form', usuario: u })} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand ring-1 ring-brand/30 hover:bg-cyan-50">
                          Editar
                        </button>
                        <button
                          onClick={() => setModal({ tipo: 'estado', usuario: u })}
                          disabled={propio}
                          title={propio ? 'No puedes desactivar tu propia cuenta' : undefined}
                          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 disabled:cursor-not-allowed disabled:opacity-40 ${
                            u.activo ? 'text-danger ring-red-200 hover:bg-red-50' : 'text-emerald-700 ring-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {total > 0 && <Paginacion pagina={pagina} porPagina={POR_PAGINA} total={total} onCambiar={setPagina} />}

      {modal?.tipo === 'form' && (
        <Modal titulo={modal.usuario ? 'Editar usuario' : 'Nuevo usuario'} onCerrar={cerrar}>
          <UsuarioForm
            usuario={modal.usuario}
            esPropio={modal.usuario?.id === user?.id}
            onGuardar={(p) => guardar(p, modal.usuario)}
            onCancelar={cerrar}
          />
        </Modal>
      )}

      {modal?.tipo === 'estado' && (
        <Modal titulo={modal.usuario.activo ? 'Desactivar usuario' : 'Activar usuario'} onCerrar={cerrar} ancho="max-w-md">
          <p className="text-sm text-slate-600">
            {modal.usuario.activo
              ? `${modal.usuario.nombre} ${modal.usuario.apellido} perderá el acceso al sistema. Su historial de movimientos y auditorías se conserva y podrás reactivarlo cuando quieras.`
              : `${modal.usuario.nombre} ${modal.usuario.apellido} podrá volver a iniciar sesión.`}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variante="suave" onClick={cerrar}>Cancelar</Button>
            <Button variante={modal.usuario.activo ? 'peligro' : 'exito'} cargando={procesando} onClick={confirmarEstado}>
              {modal.usuario.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  )
}
