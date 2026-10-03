import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductList({ productos, onEditar, onEliminar }) {
  const { setSeleccionado, agregar, items } = useCart();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  function cantidadEnCarrito(productoId) {
    const item = items.find((it) => it.producto.id === productoId);
    return item ? item.cantidad : 0;
  }

  return (
    <div className="rounded-card">
      {/* Encabezado de la tabla, como la cabecera de una tracklist */}
      <div className="grid grid-cols-[2rem_1fr_6rem_6rem_8rem] items-center gap-4 border-b border-base-border px-4 pb-2 text-xs uppercase tracking-wide text-text-muted">
        <span>#</span>
        <span>Producto</span>
        <span className="text-right">Stock</span>
        <span className="text-right">Precio</span>
        <span></span>
      </div>

      <ul>
        {productos.map((producto, indice) => (
          <li
            key={producto.id}
            onClick={() => setSeleccionado(producto)}
            className="group grid grid-cols-[2rem_1fr_6rem_6rem_8rem] items-center gap-4 rounded-card px-4 py-2 hover:bg-base-highlight cursor-pointer"
          >
            <span className="text-sm text-text-muted group-hover:hidden">{indice + 1}</span>
            <span className="hidden text-accent-green group-hover:inline">▶</span>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-base-highlight text-text-muted">
                🎧
              </div>
              <span className="truncate text-sm font-medium text-text-primary">{producto.nombre}</span>
            </div>

            <span className={`text-right text-sm ${producto.stock === 0 ? 'text-red-400' : 'text-text-subdued'}`}>
              {producto.stock}
            </span>
            <span className="text-right text-sm text-text-subdued">${producto.precio.toFixed(2)}</span>

            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => agregar(producto, 1)}
                disabled={producto.stock === 0 || cantidadEnCarrito(producto.id) >= producto.stock}
                title={
                  cantidadEnCarrito(producto.id) >= producto.stock && producto.stock > 0
                    ? 'Ya agregaste todo el stock disponible'
                    : undefined
                }
                className="rounded-full bg-accent-green px-3 py-1 text-xs font-semibold text-black hover:bg-accent-greenHover disabled:bg-base-highlight disabled:text-text-muted"
              >
                Añadir
              </button>
              {esAdmin && (
                <>
                  <button
                    onClick={() => onEditar(producto)}
                    className="rounded-full border border-base-border px-3 py-1 text-xs text-text-subdued hover:text-text-primary"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onEliminar(producto.id)}
                    className="rounded-full border border-base-border px-3 py-1 text-xs text-text-subdued hover:text-red-400"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
