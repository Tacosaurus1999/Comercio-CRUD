import { useEffect, useState } from 'react';
import ProductList from '../components/catalog/ProductList';
import ProductFormModal from '../components/catalog/ProductFormModal';
import { productoService } from '../services/productoService';
import { useAuth } from '../context/AuthContext';

export default function CatalogPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const { usuario } = useAuth();

  async function cargarProductos() {
    setCargando(true);
    const data = await productoService.listar();
    setProductos(data);
    setCargando(false);
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function manejarGuardar(datos) {
    if (productoEditar) {
      await productoService.actualizar(productoEditar.id, datos);
    } else {
      await productoService.crear(datos);
    }
    setModalAbierto(false);
    setProductoEditar(null);
    await cargarProductos();
  }

  async function manejarEliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    await productoService.eliminar(id);
    await cargarProductos();
  }

  return (
    <div className="p-6 pb-28">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catálogo</h1>
          <p className="text-sm text-text-subdued">{productos.length} productos disponibles</p>
        </div>
        {usuario?.rol === 'admin' && (
          <button
            onClick={() => {
              setProductoEditar(null);
              setModalAbierto(true);
            }}
            className="rounded-full bg-accent-green px-4 py-2 text-sm font-semibold text-black hover:bg-accent-greenHover"
          >
            + Nuevo producto
          </button>
        )}
      </div>

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando catálogo…</p>
      ) : (
        <ProductList
          productos={productos}
          onEditar={(producto) => {
            setProductoEditar(producto);
            setModalAbierto(true);
          }}
          onEliminar={manejarEliminar}
        />
      )}

      {modalAbierto && (
        <ProductFormModal
          productoInicial={productoEditar}
          onGuardar={manejarGuardar}
          onCerrar={() => {
            setModalAbierto(false);
            setProductoEditar(null);
          }}
        />
      )}
    </div>
  );
}
