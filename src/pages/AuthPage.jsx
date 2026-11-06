import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: ''
  });
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (isRegistering) {
        // Flujo de Registro
        const { error: regErr } = await register(
          formData.email,
          formData.password,
          formData.nombre,
          formData.apellido
        );
        if (regErr) throw regErr;
        setMessage('Cuenta registrada con éxito. Ya puedes iniciar sesión.');
        setIsRegistering(false);
      } else {
        // Flujo de Login
        const { error: loginErr } = await login(formData.email, formData.password);
        if (loginErr) throw loginErr;
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Verifica tus datos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-slate-100">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">VisionStock AI</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRegistering ? 'Crear una cuenta nueva' : 'Accede a tu cuenta para gestionar el inventario'}
          </p>
        </div>

        {/* Mensajes de Estado */}
        {error && (
          <div className="p-3 mb-4 text-xs text-brand-danger bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 mb-4 text-xs text-brand-success bg-green-50 border border-green-200 rounded-lg">
            {message}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                  placeholder="Tu nombre"
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
                  placeholder="Tu apellido"
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
              placeholder="prueba@prueba.com"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-tech"
              placeholder="••••••••"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-tech hover:bg-brand-primary text-white font-semibold rounded-lg text-sm transition shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Procesando...' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Alternar entre Login y Registro */}
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setMessage('');
          }}
          className="w-full mt-5 text-xs text-slate-500 hover:text-brand-tech hover:underline text-center block"
        >
          {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}