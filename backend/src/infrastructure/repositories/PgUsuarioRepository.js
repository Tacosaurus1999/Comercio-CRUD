'use strict';

const { UsuarioRepositoryPort } = require('../../application/ports/repositories');
const { Usuario } = require('../../domain/entities/Usuario');

function filaAUsuario(fila) {
  if (!fila) return null;
  return new Usuario({
    id: fila.id,
    email: fila.email,
    passwordHash: fila.password,
    rol: fila.rol,
    createdAt: fila.created_at,
    updatedAt: fila.updated_at,
  });
}

class PgUsuarioRepository extends UsuarioRepositoryPort {
  /** @param {import('pg').Pool} pool */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async buscarPorEmail(email) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE email = $1 LIMIT 1', [
      email.trim().toLowerCase(),
    ]);
    return filaAUsuario(rows[0]);
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE id = $1 LIMIT 1', [id]);
    return filaAUsuario(rows[0]);
  }

  async crear(usuario) {
    const { rows } = await this.pool.query(
      `INSERT INTO usuarios (email, password, rol)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [usuario.email, usuario.passwordHash, usuario.rol]
    );
    return filaAUsuario(rows[0]);
  }

  async listarTodos() {
    const { rows } = await this.pool.query('SELECT * FROM usuarios ORDER BY id ASC');
    return rows.map(filaAUsuario);
  }

  async actualizar(usuario) {
    const { rows } = await this.pool.query(
      `UPDATE usuarios
          SET email = $1, rol = $2
        WHERE id = $3
        RETURNING *`,
      [usuario.email, usuario.rol, usuario.id]
    );
    return filaAUsuario(rows[0]);
  }

  async eliminar(id) {
    await this.pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  }
}

module.exports = { PgUsuarioRepository };
