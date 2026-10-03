import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function ProfilePage() {
  const { usuario: usuarioCacheado } = useAuth();
  const [usuario, setUsuario] = useState(usuarioCacheado);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    authService
      .obtenerPerfil()
      .then(setUsuario)
      .catch(() => setUsuario(usuarioCacheado))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 pb-28">
      <h1 className="mb-1 text-2xl font-bold text-text-primary">Perfil</h1>
      <p className="mb-6 text-sm text-text-subdued">Información de tu cuenta</p>

      <div className="max-w-md rounded-card bg-base-elevated p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-base-highlight text-2xl text-text-subdued">
            {usuario?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">{usuario?.email}</p>
            <p className="text-sm capitalize text-text-subdued">Rol: {usuario?.rol}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t border-base-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-subdued">Cuenta creada</span>
            <span className="text-text-primary">
              {cargando
                ? '…'
                : usuario?.createdAt
                  ? new Date(usuario.createdAt).toLocaleDateString('es-MX')
                  : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-subdued">Última actualización</span>
            <span className="text-text-primary">
              {cargando
                ? '…'
                : usuario?.updatedAt
                  ? new Date(usuario.updatedAt).toLocaleDateString('es-MX')
                  : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
