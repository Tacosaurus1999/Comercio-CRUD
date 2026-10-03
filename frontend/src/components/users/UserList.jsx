import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['cliente', 'admin'];

/**
 * Listado de usuarios en formato "tracklist" (igual que catálogo y pedidos):
 * índice a la izquierda, correo al centro, rol editable y acción de eliminar.
 * Solo visible/usable para administradores.
 */
export default function UserList({ usuarios, onActualizarRol, onEliminar }) {
  const { usuario: usuarioActual } = useAuth();
  const [guardandoId, setGuardandoId] = useState(null);

  async function manejarCambioRol(id, nuevoRol) {
    setGuardandoId(id);
    try {
      await onActualizarRol(id, nuevoRol);
    } finally {
      setGuardandoId(null);
    }
  }

  if (usuarios.length === 0) {
    return <p className="text-sm text-text-muted">No hay usuarios registrados.</p>;
  }

  return (
    <div className="rounded-card">
      <div className="grid grid-cols-[2rem_1fr_9rem_8rem] items-center gap-4 border-b border-base-border px-4 pb-2 text-xs uppercase tracking-wide text-text-muted">
        <span>#</span>
        <span>Usuario</span>
        <span>Rol</span>
        <span></span>
      </div>

      <ul>
        {usuarios.map((u, indice) => {
          const esUno_mismo = usuarioActual?.id === u.id;
          return (
            <li
              key={u.id}
              className="grid grid-cols-[2rem_1fr_9rem_8rem] items-center gap-4 rounded-card px-4 py-3 hover:bg-base-highlight"
            >
              <span className="text-sm text-text-muted">{indice + 1}</span>

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-highlight text-text-muted">
                  {u.email[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {u.email} {esUno_mismo && <span className="text-text-muted">(tú)</span>}
                  </p>
                  <p className="truncate text-xs text-text-subdued">
                    Registrado: {new Date(u.createdAt).toLocaleDateString('es-MX')}
                  </p>
                </div>
              </div>

              <select
                value={u.rol}
                disabled={guardandoId === u.id}
                onChange={(e) => manejarCambioRol(u.id, e.target.value)}
                className="rounded-md border border-base-border bg-base-panel px-2 py-1 text-xs capitalize text-text-primary outline-none focus:border-accent-green disabled:opacity-50"
              >
                {ROLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>

              <div className="flex justify-end">
                <button
                  onClick={() => onEliminar(u.id)}
                  disabled={esUno_mismo}
                  title={esUno_mismo ? 'No puedes eliminar tu propia cuenta' : undefined}
                  className="rounded-full border border-base-border px-3 py-1 text-xs text-text-subdued hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
