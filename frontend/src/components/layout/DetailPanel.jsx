import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import CheckoutModal from '../checkout/CheckoutModal';

export default function DetailPanel() {
  const { items, total, agregar, disminuir, quitar } = useCart();
  const [abierto, setAbierto] = useState(true);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="hidden md:flex h-full w-10 shrink-0 items-center justify-center bg-base-panel text-text-subdued hover:text-text-primary"
        aria-label="Mostrar carrito"
      >
        ‹
      </button>
    );
  }

  return (
    <aside className="hidden md:flex md:w-80 shrink-0 flex-col border-l border-base-border bg-base-panel">
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-sm font-semibold text-text-primary">Tu carrito</h2>
        <button
          onClick={() => setAbierto(false)}
          className="text-text-subdued hover:text-text-primary"
          aria-label="Ocultar carrito"
        >
          ›
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-text-muted">Añade productos desde el catálogo para armar tu pedido.</p>
        )}
        {items.map((it) => {
          const alcanzoStockMaximo = it.cantidad >= it.producto.stock;
          return (
            <div key={it.producto.id} className="rounded-card bg-base-elevated p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-primary">{it.producto.nombre}</p>
                  <p className="text-xs text-text-subdued">${it.producto.precio.toFixed(2)} c/u</p>
                </div>
                <button
                  onClick={() => quitar(it.producto.id)}
                  className="shrink-0 text-xs text-text-muted hover:text-red-400"
                >
                  Quitar
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => disminuir(it.producto.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-base-border text-text-subdued hover:text-text-primary"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm text-text-primary">{it.cantidad}</span>
                  <button
                    onClick={() => agregar(it.producto, 1)}
                    disabled={alcanzoStockMaximo}
                    title={alcanzoStockMaximo ? 'Ya alcanzaste el stock disponible' : undefined}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-base-border text-text-subdued hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  ${(it.producto.precio * it.cantidad).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-base-border px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-subdued">Total</span>
          <span className="font-semibold text-text-primary">${total.toFixed(2)}</span>
        </div>

        <button
          disabled={items.length === 0}
          onClick={() => setCheckoutAbierto(true)}
          className="mt-3 w-full rounded-full bg-accent-green py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-greenHover disabled:cursor-not-allowed disabled:bg-base-highlight disabled:text-text-muted"
        >
          Ir a pagar
        </button>
      </div>

      {checkoutAbierto && <CheckoutModal onCerrar={() => setCheckoutAbierto(false)} />}
    </aside>
  );
}
