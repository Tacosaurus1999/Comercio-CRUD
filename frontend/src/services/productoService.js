import api from './api';

export const productoService = {
  async listar() {
    const { data } = await api.get('/productos');
    return data;
  },

  async crear(producto) {
    const { data } = await api.post('/productos', producto);
    return data;
  },

  async actualizar(id, producto) {
    const { data } = await api.put(`/productos/${id}`, producto);
    return data;
  },

  async eliminar(id) {
    const { data } = await api.delete(`/productos/${id}`);
    return data;
  },
};
