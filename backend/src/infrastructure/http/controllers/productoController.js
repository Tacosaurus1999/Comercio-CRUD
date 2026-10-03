'use strict';

const { manejarError } = require('./authController');

function crearProductoController({ getProductCatalog, createProduct, updateProduct, deleteProduct }) {
  return {
    async listar(_req, res) {
      try {
        const productos = await getProductCatalog.ejecutar();
        res.status(200).json(productos);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async crear(req, res) {
      try {
        const producto = await createProduct.ejecutar(req.body);
        res.status(201).json(producto);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async actualizar(req, res) {
      try {
        const producto = await updateProduct.ejecutar(Number(req.params.id), req.body);
        res.status(200).json(producto);
      } catch (error) {
        manejarError(error, res);
      }
    },

    async eliminar(req, res) {
      try {
        const resultado = await deleteProduct.ejecutar(Number(req.params.id));
        res.status(200).json(resultado);
      } catch (error) {
        manejarError(error, res);
      }
    },
  };
}

module.exports = { crearProductoController };
