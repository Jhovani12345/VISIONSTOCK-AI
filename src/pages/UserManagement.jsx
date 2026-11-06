import { useEffect, useState } from 'react';
import { getUsuarios, crearUsuarioAdmin, actualizarUsuarioPerfil, eliminarUsuarioPerfil } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados de modales
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Formulario de creación
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'TRABAJADOR_ALMACEN'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.nombre.toLowerCase().includes(q) ||
            u.apellido.toLowerCase().includes(q) ||
            u.correo.toLowerCase().includes(q) ||
            u.rol.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, users]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. CREATE: Alta de nuevo usuario por el Super Admin
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await crearUsuarioAdmin(formData);
      setSuccessMsg('Usuario creado exitosamente.');
      setModalCreateOpen(false);
      setFormData({ email: '', password: '', nombre: '', apellido: '', rol: 'TRABAJADOR_ALMACEN' });
      cargarUsuarios();
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar el usuario.');
    }
  };

  // 2. UPDATE: Cambiar rol desde la tabla
  const handleRoleChange = async (userId, newRole) => {
    if (profile?.rol !== 'SUPER_ADMIN') {
      alert('Solo el Super Administrador puede asignar o modificar roles.');
      return;
    }
    try {
      await actualizarUsuarioPerfil(userId, { rol: newRole });
      cargarUsuarios();
    } catch (err) {
      alert('Error al actualizar el rol: ' + err.message);
    }
  };

  // UPDATE: Activar / Desactivar
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await actualizarUsuarioPerfil(userId, { activo: !currentStatus });
      cargarUsuarios();
    } catch (err) {
      alert('Error al cambiar el estado: ' + err.message);
    }
  };

  // 3. EDIT: Guardar edición de datos personales
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await actualizarUsuarioPerfil(editingUser.id, {
        nombre: editingUser.nombre,
        apellido: editingUser.apellido,
        rol: editingUser.rol
      });
      setModalEditOpen(false);
      setEditingUser(null);
      cargarUsuarios();
    } catch (err) {
      alert('Error al editar usuario: ' + err.message);
    }
  };

  // 4. DELETE: Eliminar registro de usuario
  const handleDeleteUser = async (userId, nombreCompleto) => {
    if (userId === profile?.id) {
      alert('No puedes eliminar tu propia cuenta en sesión.');
      return;
    }

    const seguro = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${nombreCompleto}?`);
    if (!seguro) return;

    try {
      await eliminarUsuarioPerfil(userId);
      cargarUsuarios();
    } catch (err) {
      alert('Error al eliminar usuario: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Gestión de Usuarios y Administradores</h1>
          <p className="text-sm text-slate-500">Control completo de accesos, altas y roles del sistema</p>
        </div>

        {profile?.rol === 'SUPER_ADMIN' && (
          <button
            onClick={() => {
              setErrorMsg('');
              setModalCreateOpen(true);
            }}
            className="bg-brand-tech hover:bg-brand-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
          >
            + agregar usuario
          </button>
        )}
      </div>

      {/* Mensajes de notificación */}
      {successMsg && <div className="p-3 mb-4 text-xs text-brand-success bg-green-50 rounded-lg">{successMsg}</div>}

      {/* Barra de Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o rol..."
          className="w-full md:w-80 p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech bg-white shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabla de Usuarios */}
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Cargando usuarios...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-brand-primary text-white text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Usuario</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Rol Asignado</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">No se encontraron usuarios.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-brand-dark">{u.nombre} {u.apellido}</td>
                    <td className="p-4 text-slate-600">{u.correo}</td>
                    <td className="p-4">
                      {profile?.rol === 'SUPER_ADMIN' ? (
                        <select
                          value={u.rol}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-brand-tech bg-white"
                        >
                          <option value="TRABAJADOR_ALMACEN">TRABAJADOR_ALMACEN</option>
                          <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-xs text-brand-tech">{u.rol}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.activo ? 'bg-green-100 text-brand-success' : 'bg-red-100 text-brand-danger'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Editar */}
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setModalEditOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#0284C7]/10 text-[#0284C7] hover:bg-[#0284C7] hover:text-white font-semibold text-xs rounded-lg transition-all duration-200 shadow-sm"
                        >
                          Editar
                        </button>

                        {/* Botón Activar / Desactivar */}
                        <button
                          onClick={() => toggleUserStatus(u.id, u.activo)}
                          className={`px-3 py-1.5 font-semibold text-xs rounded-lg transition-all duration-200 shadow-sm ${
                            u.activo
                              ? 'bg-amber-50 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white'
                              : 'bg-emerald-50 text-[#10B981] hover:bg-[#10B981] hover:text-white'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>

                        {/* Botón Eliminar (Solo Super Admin) */}
                        {profile?.rol === 'SUPER_ADMIN' && u.id !== profile?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, `${u.nombre} ${u.apellido}`)}
                            className="px-3 py-1.5 bg-red-50 text-[#EF4444] hover:bg-[#EF4444] hover:text-white font-semibold text-xs rounded-lg transition-all duration-200 shadow-sm"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Dar de alta usuario (CREATE) */}
      {modalCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Agregar Usuario</h2>

            {errorMsg && <div className="p-3 mb-4 text-xs text-brand-danger bg-red-50 rounded-lg">{errorMsg}</div>}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Rol Asignado</label>
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech bg-white font-semibold"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  <option value="TRABAJADOR_ALMACEN">TRABAJADOR_ALMACEN</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-tech hover:bg-brand-primary text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Editar Datos de Usuario (UPDATE) */}
      {modalEditOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Editar Usuario</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                  value={editingUser.apellido}
                  onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Rol</label>
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech bg-white font-semibold"
                  value={editingUser.rol}
                  onChange={(e) => setEditingUser({ ...editingUser, rol: e.target.value })}
                >
                  <option value="TRABAJADOR_ALMACEN">TRABAJADOR_ALMACEN</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-tech hover:bg-brand-primary text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}