import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const modulos = [
    { to: '/catalogo', etiqueta: 'Catálogo', icono: '▤' },
    { to: '/pedidos', etiqueta: esAdmin ? 'Todos los pedidos' : 'Tus pedidos', icono: '◷' },
    { to: '/perfil', etiqueta: 'Perfil', icono: '◉' },
  ];

  const modulosAdmin = [{ to: '/usuarios', etiqueta: 'Usuarios', icono: '☰' }];

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-base-black h-full">
      <div className="px-6 pt-6 pb-4">
        <span className="text-xl font-bold tracking-tight text-text-primary">Tienda</span>
        {esAdmin && (
          <span className="ml-2 rounded-full bg-accent-green/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-green">
            Admin
          </span>
        )}
      </div>

      <nav className="px-2">
        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Módulos
        </p>
        <ul className="space-y-1">
          {modulos.map((modulo) => (
            <li key={modulo.to}>
              <NavLink
                to={modulo.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-card px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-base-highlight text-text-primary'
                      : 'text-text-subdued hover:text-text-primary'
                  }`
                }
              >
                <span aria-hidden className="text-base">{modulo.icono}</span>
                {modulo.etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>

        {esAdmin && (
          <>
            <p className="px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Administración
            </p>
            <ul className="space-y-1">
              {modulosAdmin.map((modulo) => (
                <li key={modulo.to}>
                  <NavLink
                    to={modulo.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-card px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-base-highlight text-text-primary'
                          : 'text-text-subdued hover:text-text-primary'
                      }`
                    }
                  >
                    <span aria-hidden className="text-base">{modulo.icono}</span>
                    {modulo.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="mt-auto px-4 pb-6">
        <div className="rounded-card bg-base-elevated p-3">
          <p className="truncate text-sm font-medium text-text-primary">{usuario?.email}</p>
          <p className="text-xs text-text-subdued capitalize">{usuario?.rol}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-full border border-base-border py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-text-primary"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}

