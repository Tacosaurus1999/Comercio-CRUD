'use strict';

const { Router } = require('express');

/** Rutas de administración de usuarios: todas exigen rol admin. */
function crearUsuarioRoutes(usuarioController, autenticar, requerirAdmin) {
  const router = Router();

  router.get('/', autenticar, requerirAdmin, usuarioController.listar);
  router.put('/:id', autenticar, requerirAdmin, usuarioController.actualizar);
  router.delete('/:id', autenticar, requerirAdmin, usuarioController.eliminar);

  return router;
}

module.exports = { crearUsuarioRoutes };
