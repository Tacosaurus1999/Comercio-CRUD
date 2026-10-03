'use strict';

const { manejarError } = require('./authController');

function crearPedidoController({
  createOrderWithStockCheck,
  getOrderHistory,
  listAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
}) {
  return {
    async crear(req, res) {
      try {
        const usuarioId = req.usuario.id;
        const { items } = req.body; // [{ productoId, cantidad }]
        const pedido = await createOrderWithStockCheck.ejecutar(usuarioId, items);
        res.status(201).json(pedido);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async historial(req, res) {
      try {
        const usuarioId = req.usuario.id;
        const pedidos = await getOrderHistory.ejecutar(usuarioId);
        res.status(200).json(pedidos);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async listarTodos(_req, res) {
      try {
        const pedidos = await listAllOrders.ejecutar();
        res.status(200).json(pedidos);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async actualizarEstado(req, res) {
      try {
        const pedido = await updateOrderStatus.ejecutar(Number(req.params.id), req.body.estado);
        res.status(200).json(pedido);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async cancelar(req, res) {
      try {
        const pedido = await cancelOrder.ejecutar(Number(req.params.id), req.usuario.id);
        res.status(200).json(pedido);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async eliminar(req, res) {
      try {
        const resultado = await deleteOrder.ejecutar(Number(req.params.id));
        res.status(200).json(resultado);
      } catch (error) {
        manejarError(error, res);
      }
    },
  };
}

module.exports = { crearPedidoController };
