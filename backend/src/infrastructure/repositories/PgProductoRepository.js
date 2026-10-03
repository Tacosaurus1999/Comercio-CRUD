'use strict';

const { ProductoRepositoryPort } = require('../../application/ports/repositories');
const { Producto } = require('../../domain/entities/Producto');

function filaAProducto(fila) {
  if (!fila) return null;
  return new Producto({
    id: fila.id,
    nombre: fila.nombre,
    precio: fila.precio,
    stock: fila.stock,
    imagenUrl: fila.imagen_url,
    createdAt: fila.created_at,
    updatedAt: fila.updated_at,
  });
}

class PgProductoRepository extends ProductoRepositoryPort {
  /** @param {import('pg').Pool} pool */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async listarTodos() {
    const { rows } = await this.pool.query('SELECT * FROM productos ORDER BY id ASC');
    return rows.map(filaAProducto);
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM productos WHERE id = $1 LIMIT 1', [id]);
    return filaAProducto(rows[0]);
  }

  async crear(producto) {
    const { rows } = await this.pool.query(
      `INSERT INTO productos (nombre, precio, stock, imagen_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [producto.nombre, producto.precio, producto.stock, producto.imagenUrl]
    );
    return filaAProducto(rows[0]);
  }

  async actualizar(producto) {
    const { rows } = await this.pool.query(
      `UPDATE productos
          SET nombre = $1, precio = $2, stock = $3, imagen_url = $4
        WHERE id = $5
        RETURNING *`,
      [producto.nombre, producto.precio, producto.stock, producto.imagenUrl, producto.id]
    );
    return filaAProducto(rows[0]);
  }

  async eliminar(id) {
    await this.pool.query('DELETE FROM productos WHERE id = $1', [id]);
  }

  /**
   * Descuenta stock en una sola sentencia UPDATE condicional, evitando
   * condiciones de carrera entre "leer stock" y "escribir stock".
   * @returns {Promise<boolean>} true si affectedRows (rowCount) > 0
   */
  async descontarStockAtomico(id, cantidad) {
    const resultado = await this.pool.query(
      'UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
      [cantidad, id]
    );
    return resultado.rowCount > 0;
  }

  /**
   * Operación inversa: reingresa stock (usada al cancelar/eliminar pedidos).
   */
  async incrementarStock(id, cantidad) {
    await this.pool.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [cantidad, id]);
  }
}

module.exports = { PgProductoRepository };
