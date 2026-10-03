'use strict';

const { DomainError } = require('../../../domain/errors/DomainError');

const CODIGOS_HTTP = {
  CREDENCIALES_INVALIDAS: 401,
  EMAIL_DUPLICADO: 409,
  USUARIO_NO_ENCONTRADO: 404,
  PRODUCTO_NO_ENCONTRADO: 404,
  PEDIDO_NO_ENCONTRADO: 404,
  STOCK_INSUFICIENTE: 409,
  PEDIDO_AJENO: 403,
  ESTADO_INVALIDO: 409,
  PEDIDO_CANCELADO: 409,
  AUTOELIMINACION: 409,
};

function crearAuthController({ registerUser, loginUser, getUserProfile }) {
  return {
    async registrar(req, res) {
      try {
        const usuario = await registerUser.ejecutar(req.body);
        res.status(201).json(usuario);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async login(req, res) {
      try {
        const resultado = await loginUser.ejecutar(req.body);
        res.status(200).json(resultado);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async perfil(req, res) {
      try {
        const usuario = await getUserProfile.ejecutar(req.usuario.id);
        res.status(200).json(usuario);
      } catch (error) {
        manejarError(error, res);
      }
    },
  };
}

function manejarError(error, res) {
  if (error instanceof DomainError) {
    const codigoHttp = CODIGOS_HTTP[error.codigo] || 400;
    return res.status(codigoHttp).json({ error: error.message, codigo: error.codigo });
  }
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = { crearAuthController, manejarError };
