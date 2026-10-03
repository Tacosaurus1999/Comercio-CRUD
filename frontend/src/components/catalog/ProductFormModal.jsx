import { useState } from 'react';

const VACIO = { nombre: '', precio: '', stock: '', imagenUrl: '' };

export default function ProductFormModal({ productoInicial, onGuardar, onCerrar }) {
  const [form, setForm] = useState(productoInicial ? { ...productoInicial } : VACIO);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function actualizarCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        nombre: form.nombre,
        precio: Number(form.precio),
        stock: Number(form.stock),
        imagenUrl: form.imagenUrl || null,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
      <form
        onSubmit={manejarSubmit}
        className="w-full max-w-md rounded-card bg-base-elevated p-6 shadow-xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          {productoInicial ? 'Editar producto' : 'Nuevo producto'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text-subdued">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              className="w-full rounded-md border border-base-border bg-base-panel px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-text-subdued">Precio</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.precio}
                onChange={(e) => actualizarCampo('precio', e.target.value)}
                className="w-full rounded-md border border-base-border bg-base-panel px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-subdued">Stock</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => actualizarCampo('stock', e.target.value)}
                className="w-full rounded-md border border-base-border bg-base-panel px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-subdued">URL de imagen (opcional)</label>
            <input
              value={form.imagenUrl || ''}
              onChange={(e) => actualizarCampo('imagenUrl', e.target.value)}
              className="w-full rounded-md border border-base-border bg-base-panel px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-full border border-base-border px-4 py-2 text-xs text-text-subdued hover:text-text-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-full bg-accent-green px-4 py-2 text-xs font-semibold text-black hover:bg-accent-greenHover disabled:opacity-60"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
