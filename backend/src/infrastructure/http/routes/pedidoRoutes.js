'use strict';

const { Router } = require('express');

function crearPedidoRoutes(pedidoController, autenticar, requerirAdmin) {
  const router = Router();

  // Usuario autenticado
  router.post('/', autenticar, pedidoController.crear);
  router.get('/', autenticar, pedidoController.historial);
  router.post('/:id/cancelar', autenticar, pedidoController.cancelar);

  // Administración
  router.get('/admin/todos', autenticar, requerirAdmin, pedidoController.listarTodos);
  router.put('/:id/estado', autenticar, requerirAdmin, pedidoController.actualizarEstado);
  router.delete('/:id', autenticar, requerirAdmin, pedidoController.eliminar);

  return router;
}

module.exports = { crearPedidoRoutes };
