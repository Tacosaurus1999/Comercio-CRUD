'use strict';

const { Router } = require('express');

function crearAuthRoutes(authController, autenticar) {
  const router = Router();

  router.post('/registro', authController.registrar);
  router.post('/login', authController.login);
  router.get('/perfil', autenticar, authController.perfil);

  return router;
}

module.exports = { crearAuthRoutes };
