'use strict';

const { Producto } = require('../../domain/entities/Producto');
const { DomainError } = require('../../domain/errors/DomainError');

/** Caso de uso: GetProductCatalog */
class GetProductCatalog {
  /** @param {import('../ports/repositories').ProductoRepositoryPort} productoRepository */
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async ejecutar() {
    const productos = await this.productoRepository.listarTodos();
    return productos.map((p) => p.toJSON());
  }
}

/** Caso de uso: CreateProduct */
class CreateProduct {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async ejecutar({ nombre, precio, stock, imagenUrl }) {
    const producto = new Producto({ nombre, precio, stock, imagenUrl });
    const creado = await this.productoRepository.crear(producto);
    return creado.toJSON();
  }
}

/** Caso de uso: UpdateProduct */
class UpdateProduct {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async ejecutar(id, { nombre, precio, stock, imagenUrl }) {
    const existente = await this.productoRepository.buscarPorId(id);
    if (!existente) {
      throw new DomainError('Producto no encontrado.', 'PRODUCTO_NO_ENCONTRADO');
    }

    const actualizado = new Producto({
      id,
      nombre: nombre ?? existente.nombre,
      precio: precio ?? existente.precio,
      stock: stock ?? existente.stock,
      imagenUrl: imagenUrl ?? existente.imagenUrl,
    });

    const guardado = await this.productoRepository.actualizar(actualizado);
    return guardado.toJSON();
  }
}

/** Caso de uso: DeleteProduct */
class DeleteProduct {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async ejecutar(id) {
    const existente = await this.productoRepository.buscarPorId(id);
    if (!existente) {
      throw new DomainError('Producto no encontrado.', 'PRODUCTO_NO_ENCONTRADO');
    }
    await this.productoRepository.eliminar(id);
    return { id };
  }
}

module.exports = { GetProductCatalog, CreateProduct, UpdateProduct, DeleteProduct };
