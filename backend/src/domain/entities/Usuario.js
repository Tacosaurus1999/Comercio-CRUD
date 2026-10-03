'use strict';

const { DomainError } = require('../errors/DomainError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

/**
 * Entidad pura de Usuario. No conoce MySQL, Express ni bcrypt:
 * solo las reglas de negocio que definen qué es un usuario válido.
 */
class Usuario {
  /**
   * @param {Object} params
   * @param {number|null} params.id
   * @param {string} params.email
   * @param {string} params.passwordHash - contraseña YA cifrada
   * @param {'cliente'|'admin'} params.rol
   */
  constructor({ id = null, email, passwordHash, rol = 'cliente', createdAt = null, updatedAt = null }) {
    Usuario.validarEmail(email);

    this.id = id;
    this.email = email.trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.rol = rol;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static validarEmail(email) {
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      throw new DomainError('El correo electrónico no tiene un formato válido.');
    }
  }

  /**
   * Regla de negocio: una contraseña en texto plano debe cumplir
   * un mínimo de seguridad antes de ser cifrada por la capa de infraestructura.
   */
  static validarPasswordPlano(passwordPlano) {
    if (!passwordPlano || typeof passwordPlano !== 'string') {
      throw new DomainError('La contraseña es obligatoria.');
    }
    if (passwordPlano.length < PASSWORD_MIN_LENGTH) {
      throw new DomainError(
        `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
      );
    }
    if (!/[0-9]/.test(passwordPlano) || !/[A-Za-z]/.test(passwordPlano)) {
      throw new DomainError('La contraseña debe combinar letras y números.');
    }
  }

  esAdmin() {
    return this.rol === 'admin';
  }

  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      rol: this.rol,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = { Usuario, PASSWORD_MIN_LENGTH };
