import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ producto, cantidad }]
  const [seleccionado, setSeleccionado] = useState(null); // producto resaltado en la barra inferior

  /**
   * Añade un producto al carrito validando que la cantidad acumulada
   * nunca exceda el stock disponible reportado por el catálogo.
   */
  function agregar(producto, cantidad = 1) {
    if (producto.stock <= 0) return;

    setItems((actual) => {
      const existente = actual.find((it) => it.producto.id === producto.id);
      const cantidadActual = existente ? existente.cantidad : 0;
      const cantidadFinal = Math.min(cantidadActual + cantidad, producto.stock);

      if (existente) {
        return actual.map((it) =>
          it.producto.id === producto.id ? { ...it, cantidad: cantidadFinal } : it
        );
      }
      return [...actual, { producto, cantidad: cantidadFinal }];
    });
    setSeleccionado(producto);
  }

  function quitar(productoId) {
    setItems((actual) => actual.filter((it) => it.producto.id !== productoId));
  }

  /** Disminuye en 1 la cantidad de un ítem; lo elimina si llega a 0. */
  function disminuir(productoId) {
    setItems((actual) =>
      actual
        .map((it) => (it.producto.id === productoId ? { ...it, cantidad: it.cantidad - 1 } : it))
        .filter((it) => it.cantidad > 0)
    );
  }

  function vaciar() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.producto.precio * it.cantidad, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, total, seleccionado, setSeleccionado, agregar, disminuir, quitar, vaciar }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) throw new Error('useCart debe usarse dentro de CartProvider');
  return contexto;
}
