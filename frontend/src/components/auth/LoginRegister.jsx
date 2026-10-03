import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginRegister() {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { login, registrar } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      if (modo === 'login') {
        await login({ email, password });
        navigate('/catalogo');
      } else {
        await registrar({ email, password });
        setModo('login');
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-black px-4">
      <div className="w-full max-w-sm rounded-card bg-base-panel p-8">
        <h1 className="mb-1 text-center text-2xl font-bold text-text-primary">Tienda</h1>
        <p className="mb-6 text-center text-sm text-text-subdued">
          {modo === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
        </p>

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-subdued">Correo electrónico</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-base-border bg-base-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-green"
              placeholder="nombre@correo.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-subdued">Contraseña</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-base-border bg-base-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-green"
              placeholder="Mínimo 8 caracteres, letras y números"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-full bg-accent-green py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-greenHover disabled:opacity-60"
          >
            {cargando ? 'Procesando…' : modo === 'login' ? 'Iniciar sesión' : 'Registrarme'}
          </button>
        </form>

        <button
          onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
          className="mt-5 w-full text-center text-xs text-text-subdued hover:text-text-primary"
        >
          {modo === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}
