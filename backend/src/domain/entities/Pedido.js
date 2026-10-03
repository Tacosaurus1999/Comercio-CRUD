'use strict';

const { DomainError } = require('../errors/DomainError');

const ESTADOS_VALIDOS = ['pendiente', 'pagado', 'enviado', 'cancelado'];

class PedidoItem {
  constructor({ productoId, nombreProducto, cantidad, precioUnitario }) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new DomainError('La cantidad de cada ítem del pedido debe ser un entero positivo.');
    }
    if (Number.isNaN(Number(precioUnitario)) || Number(precioUnitario) < 0) {
      throw new DomainError('El precio unitario del ítem no es válido.');
    }
    this.productoId = productoId;
    this.nombreProducto = nombreProducto;
    this.cantidad = cantidad;
    this.precioUnitario = Number(precioUnitario);
  }

  get subtotal() {
    return Number((this.precioUnitario * this.cantidad).toFixed(2));
  }
}

class Pedido {
  constructor({ id = null, usuarioId, items = [], estado = 'pendiente', createdAt = null, updatedAt = null }) {
    if (!usuarioId) {
      throw new DomainError('El pedido debe estar asociado a un usuario.');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new DomainError('El pedido debe contener al menos un producto.');
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new DomainError(`Estado de pedido inválido: ${estado}.`);
    }

    this.id = id;
    this.usuarioId = usuarioId;
    this.items = items.map((it) => (it instanceof PedidoItem ? it : new PedidoItem(it)));
    this.estado = estado;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Regla de negocio: cálculo exacto del monto total acumulado del pedido.
   */
  calcularTotal() {
    const total = this.items.reduce((acc, item) => acc + item.subtotal, 0);
    return Number(total.toFixed(2));
  }

  cambiarEstado(nuevoEstado) {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      throw new DomainError(`Estado de pedido inválido: ${nuevoEstado}.`);
    }
    this.estado = nuevoEstado;
  }

  toJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      estado: this.estado,
      total: this.calcularTotal(),
      items: this.items.map((it) => ({
        productoId: it.productoId,
        nombreProducto: it.nombreProducto,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.subtotal,
      })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = { Pedido, PedidoItem, ESTADOS_VALIDOS };
