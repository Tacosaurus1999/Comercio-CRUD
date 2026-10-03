import api from './api';

export const pedidoService = {
  async crear(items) {
    const { data } = await api.post('/pedidos', { items });
    return data;
  },

  async historial() {
    const { data } = await api.get('/pedidos');
    return data;
  },

  /** Uso administrativo: todos los pedidos de todos los usuarios */
  async listarTodos() {
    const { data } = await api.get('/pedidos/admin/todos');
    return data;
  },

  /** Uso administrativo: avanzar el estado de un pedido */
  async actualizarEstado(id, estado) {
    const { data } = await api.put(`/pedidos/${id}/estado`, { estado });
    return data;
  },

  /** El propio dueño cancela su pedido mientras esté "pendiente" */
  async cancelar(id) {
    const { data } = await api.post(`/pedidos/${id}/cancelar`);
    return data;
  },

  /** Uso administrativo: eliminación física del pedido */
  async eliminar(id) {
    const { data } = await api.delete(`/pedidos/${id}`);
    return data;
  },
};
