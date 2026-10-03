'use strict';

const { Router } = require('express');

function crearProductoRoutes(productoController, autenticar, requerirAdmin) {
  const router = Router();

  router.get('/', productoController.listar);
  router.post('/', autenticar, requerirAdmin, productoController.crear);
  router.put('/:id', autenticar, requerirAdmin, productoController.actualizar);
  router.delete('/:id', autenticar, requerirAdmin, productoController.eliminar);

  return router;
}

module.exports = { crearProductoRoutes };
