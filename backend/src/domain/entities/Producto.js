'use strict';

const { DomainError } = require('../errors/DomainError');

class Producto {
  constructor({ id = null, nombre, precio, stock, imagenUrl = null, createdAt = null, updatedAt = null }) {
    Producto.validar({ nombre, precio, stock });

    this.id = id;
    this.nombre = nombre.trim();
    this.precio = Number(precio);
    this.stock = Number(stock);
    this.imagenUrl = imagenUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static validar({ nombre, precio, stock }) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      throw new DomainError('El nombre del producto debe tener al menos 2 caracteres.');
    }
    if (precio === undefined || Number.isNaN(Number(precio)) || Number(precio) < 0) {
      throw new DomainError('El precio del producto debe ser un número mayor o igual a 0.');
    }
    if (stock === undefined || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      throw new DomainError('El stock debe ser un entero mayor o igual a 0.');
    }
  }

  /**
   * Regla de negocio: comprobación de stock disponible al ordenar.
   */
  verificarStockDisponible(cantidadSolicitada) {
    if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada <= 0) {
      throw new DomainError(`La cantidad solicitada de "${this.nombre}" debe ser un entero positivo.`);
    }
    if (cantidadSolicitada > this.stock) {
      throw new DomainError(
        `Stock insuficiente para "${this.nombre}". Disponible: ${this.stock}, solicitado: ${cantidadSolicitada}.`,
        'STOCK_INSUFICIENTE'
      );
    }
  }

  descontarStock(cantidad) {
    this.verificarStockDisponible(cantidad);
    this.stock -= cantidad;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      precio: this.precio,
      stock: this.stock,
      imagenUrl: this.imagenUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = { Producto };
