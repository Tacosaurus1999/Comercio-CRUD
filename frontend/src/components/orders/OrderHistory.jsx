const COLOR_ESTADO = {
  pendiente: 'text-yellow-400',
  pagado: 'text-accent-green',
  enviado: 'text-blue-400',
  cancelado: 'text-red-400',
};

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'cancelado'];

/**
 * Historial de pedidos en formato "tracklist", igual que el catálogo:
 * índice a la izquierda, información del pedido al centro y el total
 * alineado a la derecha (en vez de la duración de una canción).
 */
export default function OrderHistory({ pedidos, esAdmin, onCancelar, onActualizarEstado, onEliminar }) {
  if (pedidos.length === 0) {
    return <p className="text-sm text-text-muted">Todavía no hay pedidos registrados.</p>;
  }

  return (
    <div className="rounded-card">
      <div className="grid grid-cols-[2rem_1fr_7rem_6rem_10rem] items-center gap-4 border-b border-base-border px-4 pb-2 text-xs uppercase tracking-wide text-text-muted">
        <span>#</span>
        <span>Pedido</span>
        <span>Estado</span>
        <span className="text-right">Total</span>
        <span></span>
      </div>

      <ul>
        {pedidos.map((pedido, indice) => {
          const primerItem = pedido.items[0];
          const resumen =
            pedido.items.length > 1
              ? `${primerItem.nombreProducto} y ${pedido.items.length - 1} más`
              : primerItem.nombreProducto;

          return (
            <li
              key={pedido.id}
              className="grid grid-cols-[2rem_1fr_7rem_6rem_10rem] items-center gap-4 rounded-card px-4 py-3 hover:bg-base-highlight"
            >
              <span className="text-sm text-text-muted">{indice + 1}</span>

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-base-highlight text-text-muted">
                  🧾
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    Pedido #{pedido.id} · {resumen}
                  </p>
                  <p className="truncate text-xs text-text-subdued">
                    {new Date(pedido.createdAt).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>

              {esAdmin ? (
                <select
                  value={pedido.estado}
                  disabled={pedido.estado === 'cancelado'}
                  onChange={(e) => onActualizarEstado(pedido.id, e.target.value)}
                  className="rounded-md border border-base-border bg-base-panel px-2 py-1 text-xs text-text-primary outline-none focus:border-accent-green disabled:opacity-50"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`text-xs font-semibold uppercase ${COLOR_ESTADO[pedido.estado] || 'text-text-subdued'}`}>
                  {pedido.estado}
                </span>
              )}

              <span className="text-right text-sm font-semibold text-text-primary">
                ${pedido.total.toFixed(2)}
              </span>

              <div className="flex justify-end gap-2">
                {!esAdmin && pedido.estado === 'pendiente' && (
                  <button
                    onClick={() => onCancelar(pedido.id)}
                    className="rounded-full border border-base-border px-3 py-1 text-xs text-text-subdued hover:text-red-400"
                  >
                    Cancelar
                  </button>
                )}
                {esAdmin && (
                  <button
                    onClick={() => onEliminar(pedido.id)}
                    className="rounded-full border border-base-border px-3 py-1 text-xs text-text-subdued hover:text-red-400"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
