'use strict';

const { PedidoRepositoryPort } = require('../../application/ports/repositories');
const { Pedido, PedidoItem } = require('../../domain/entities/Pedido');

class PgPedidoRepository extends PedidoRepositoryPort {
  /** @param {import('pg').Pool} pool */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async crear(pedido) {
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');

      const { rows } = await cliente.query(
        `INSERT INTO pedidos (usuario_id, total, estado)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [pedido.usuarioId, pedido.calcularTotal(), pedido.estado]
      );
      const pedidoId = rows[0].id;

      for (const item of pedido.items) {
        await cliente.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4)`,
          [pedidoId, item.productoId, item.cantidad, item.precioUnitario]
        );
      }

      await cliente.query('COMMIT');
      return this.buscarPorId(pedidoId);
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  async listarPorUsuario(usuarioId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuarioId]
    );
    return Promise.all(rows.map((fila) => this._hidratarPedido(fila)));
  }

  async listarTodos() {
    const { rows } = await this.pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
    return Promise.all(rows.map((fila) => this._hidratarPedido(fila)));
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM pedidos WHERE id = $1 LIMIT 1', [id]);
    if (!rows[0]) return null;
    return this._hidratarPedido(rows[0]);
  }

  async actualizarEstado(id, estado) {
    await this.pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
    return this.buscarPorId(id);
  }

  async eliminar(id) {
    await this.pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
  }

  async _hidratarPedido(filaPedido) {
    const { rows: filasItems } = await this.pool.query(
      `SELECT pi.producto_id, pi.cantidad, pi.precio_unitario, p.nombre AS nombre_producto
         FROM pedido_items pi
         JOIN productos p ON p.id = pi.producto_id
        WHERE pi.pedido_id = $1`,
      [filaPedido.id]
    );

    const items = filasItems.map(
      (fi) =>
        new PedidoItem({
          productoId: fi.producto_id,
          nombreProducto: fi.nombre_producto,
          cantidad: fi.cantidad,
          precioUnitario: fi.precio_unitario,
        })
    );

    return new Pedido({
      id: filaPedido.id,
      usuarioId: filaPedido.usuario_id,
      items,
      estado: filaPedido.estado,
      createdAt: filaPedido.created_at,
      updatedAt: filaPedido.updated_at,
    });
  }
}

module.exports = { PgPedidoRepository };
