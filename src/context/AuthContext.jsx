import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de estado (Inicio / Cierre de sesión)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Consultar el perfil del usuario para obtener su ROL y datos personales
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error al cargar perfil:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Método de Inicio de Sesión único
  const login = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  // Método de Registro de Trabajadores
  const register = (email, password, nombre, apellido) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
          rol: 'TRABAJADOR_ALMACEN' // Rol por defecto al registrarse
        }
      }
    });
  };

  // Método de Cierre de Sesión
  const logout = () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);