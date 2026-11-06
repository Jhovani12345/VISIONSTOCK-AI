import { supabase } from './supabase';

// 1. Obtener todos los usuarios
export const getUsuarios = async () => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .order('fecha_registro', { ascending: false });

  if (error) throw error;
  return data;
};

// 2. Crear usuario directamente con perfil y rol asignado
export const crearUsuarioAdmin = async ({ email, password, nombre, apellido, rol }) => {
  // Registramos al usuario en Supabase Auth pasándole la metadata completa
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        apellido,
        rol // Asigna directamente el rol seleccionado (ADMINISTRADOR, TRABAJADOR_ALMACEN, SUPER_ADMIN)
      }
    }
  });

  if (error) throw error;
  return data;
};

// 3. Actualizar información y rol de usuario
export const actualizarUsuarioPerfil = async (id, campos) => {
  const { data, error } = await supabase
    .from('perfiles')
    .update(campos)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

// 4. Eliminar registro de usuario
export const eliminarUsuarioPerfil = async (id) => {
  const { data, error } = await supabase
    .from('perfiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};