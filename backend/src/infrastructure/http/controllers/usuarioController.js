'use strict';

const { manejarError } = require('./authController');

/** CRUD administrativo de usuarios (Read/Update/Delete; el Create es el registro público). */
function crearUsuarioController({ listUsers, updateUser, deleteUser }) {
  return {
    async listar(_req, res) {
      try {
        const usuarios = await listUsers.ejecutar();
        res.status(200).json(usuarios);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async actualizar(req, res) {
      try {
        const usuario = await updateUser.ejecutar(Number(req.params.id), req.body);
        res.status(200).json(usuario);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async eliminar(req, res) {
      try {
        const resultado = await deleteUser.ejecutar(Number(req.params.id), req.usuario.id);
        res.status(200).json(resultado);
      } catch (error) {
        manejarError(error, res);
      }
    },
  };
}

module.exports = { crearUsuarioController };
