import { useCart } from '../../context/CartContext';

export default function BottomBar() {
  const { seleccionado, items, agregar } = useCart();

  const enCarrito = seleccionado ? items.find((it) => it.producto.id === seleccionado.id) : null;
  const sinStockDisponible =
    !seleccionado || seleccionado.stock === 0 || (enCarrito && enCarrito.cantidad >= seleccionado.stock);

  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 flex h-20 items-center justify-between border-t border-base-border bg-base-elevated px-4 md:px-6">
      {/* Producto seleccionado, estilo "now playing" */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {seleccionado ? (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-base-highlight text-lg text-text-subdued">
              🎧
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{seleccionado.nombre}</p>
              <p className="truncate text-xs text-text-subdued">
                ${seleccionado.precio.toFixed(2)} · stock restante: {seleccionado.stock}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted">Ningún producto seleccionado</p>
        )}
      </div>

      {/* Control central: botón "play" que añade rápidamente al carrito */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <button
          disabled={sinStockDisponible}
          onClick={() => seleccionado && agregar(seleccionado, 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-green text-black transition-transform hover:scale-105 hover:bg-accent-greenHover disabled:cursor-not-allowed disabled:bg-base-highlight disabled:text-text-muted disabled:hover:scale-100"
          aria-label="Añadir rápidamente al carrito"
          title="Añadir rápidamente al carrito"
        >
          {/* Triángulo de "reproducción" estilo Spotify, reutilizado como acción de compra */}
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="text-[11px] text-text-muted">Añadir al carrito</span>
      </div>

      {/* Indicador visual de stock restante */}
      <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
        {seleccionado && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-base-highlight">
              <div
                className="h-full bg-accent-green"
                style={{
                  width: `${Math.min(100, (seleccionado.stock / Math.max(seleccionado.stock, 20)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-xs text-text-subdued">{seleccionado.stock} disp.</span>
          </div>
        )}
      </div>
    </footer>
  );
}
