'use strict';

/**
 * PUERTOS (contratos lógicos) — capa de Aplicación.
 * Estas clases NO tienen implementación: documentan el contrato que
 * los adaptadores de infraestructura (PostgreSQL) deben cumplir.
 * Los casos de uso dependen únicamente de estas interfaces, nunca
 * del driver `pg` directamente (inversión de dependencias).
 */

class UsuarioRepositoryPort {
  /** @returns {Promise<Usuario|null>} */
  async buscarPorEmail(_email) {
    throw new Error('No implementado: buscarPorEmail');
  }

  /** @returns {Promise<Usuario|null>} */
  async buscarPorId(_id) {
    throw new Error('No implementado: buscarPorId');
  }

  /** @returns {Promise<Usuario>} usuario persistido con id asignado */
  async crear(_usuario) {
    throw new Error('No implementado: crear');
  }

  /** @returns {Promise<Usuario[]>} */
  async listarTodos() {
    throw new Error('No implementado: listarTodos');
  }

  /** @returns {Promise<Usuario>} */
  async actualizar(_usuario) {
    throw new Error('No implementado: actualizar');
  }

  async eliminar(_id) {
    throw new Error('No implementado: eliminar');
  }
}

class ProductoRepositoryPort {
  /** @returns {Promise<Producto[]>} */
  async listarTodos() {
    throw new Error('No implementado: listarTodos');
  }

  /** @returns {Promise<Producto|null>} */
  async buscarPorId(_id) {
    throw new Error('No implementado: buscarPorId');
  }

  /** @returns {Promise<Producto>} */
  async crear(_producto) {
    throw new Error('No implementado: crear');
  }

  /** @returns {Promise<Producto>} */
  async actualizar(_producto) {
    throw new Error('No implementado: actualizar');
  }

  async eliminar(_id) {
    throw new Error('No implementado: eliminar');
  }

  /**
   * Descuenta stock de forma atómica (debe usar transacción / UPDATE condicional).
   * @returns {Promise<boolean>} true si había stock suficiente y se descontó
   */
  async descontarStockAtomico(_id, _cantidad) {
    throw new Error('No implementado: descontarStockAtomico');
  }

  /**
   * Operación inversa a descontarStockAtomico: reingresa stock
   * (usada al cancelar o eliminar pedidos).
   */
  async incrementarStock(_id, _cantidad) {
    throw new Error('No implementado: incrementarStock');
  }
}

class PedidoRepositoryPort {
  /** @returns {Promise<Pedido>} pedido persistido con id asignado */
  async crear(_pedido) {
    throw new Error('No implementado: crear');
  }

  /** @returns {Promise<Pedido[]>} */
  async listarPorUsuario(_usuarioId) {
    throw new Error('No implementado: listarPorUsuario');
  }

  /** @returns {Promise<Pedido[]>} todos los pedidos (uso administrativo) */
  async listarTodos() {
    throw new Error('No implementado: listarTodos');
  }

  /** @returns {Promise<Pedido|null>} */
  async buscarPorId(_id) {
    throw new Error('No implementado: buscarPorId');
  }

  /** @returns {Promise<Pedido>} pedido con el nuevo estado persistido */
  async actualizarEstado(_id, _estado) {
    throw new Error('No implementado: actualizarEstado');
  }

  async eliminar(_id) {
    throw new Error('No implementado: eliminar');
  }
}

module.exports = { UsuarioRepositoryPort, ProductoRepositoryPort, PedidoRepositoryPort };
