import { useEffect, useState } from 'react';
import OrderHistory from '../components/orders/OrderHistory';
import { pedidoService } from '../services/pedidoService';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  async function cargarPedidos() {
    setCargando(true);
    setError(null);
    try {
      const data = esAdmin ? await pedidoService.listarTodos() : await pedidoService.historial();
      setPedidos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin]);

  async function manejarCancelar(id) {
    if (!confirm('¿Cancelar este pedido? El stock reservado se devolverá al catálogo.')) return;
    try {
      await pedidoService.cancelar(id);
      await cargarPedidos();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar el pedido.');
    }
  }

  async function manejarActualizarEstado(id, estado) {
    try {
      await pedidoService.actualizarEstado(id, estado);
      await cargarPedidos();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el estado.');
    }
  }

  async function manejarEliminar(id) {
    if (!confirm('¿Eliminar este pedido de forma permanente?')) return;
    try {
      await pedidoService.eliminar(id);
      await cargarPedidos();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar el pedido.');
    }
  }

  return (
    <div className="p-6 pb-28">
      <h1 className="mb-1 text-2xl font-bold text-text-primary">
        {esAdmin ? 'Todos los pedidos' : 'Tus pedidos'}
      </h1>
      <p className="mb-6 text-sm text-text-subdued">
        {esAdmin ? 'Vista administrativa de todos los pedidos' : 'Historial y estado de tus compras'}
      </p>

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando pedidos…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <OrderHistory
          pedidos={pedidos}
          esAdmin={esAdmin}
          onCancelar={manejarCancelar}
          onActualizarEstado={manejarActualizarEstado}
          onEliminar={manejarEliminar}
        />
      )}
    </div>
  );
}
