'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CifradoServicePort, TokenServicePort } = require('../../application/ports/CifradoService');

const SALT_ROUNDS = 10;

class BcryptCifradoService extends CifradoServicePort {
  async hashear(passwordPlano) {
    return bcrypt.hash(passwordPlano, SALT_ROUNDS);
  }

  async comparar(passwordPlano, hash) {
    return bcrypt.compare(passwordPlano, hash);
  }
}

class JwtTokenService extends TokenServicePort {
  constructor(secreto, expiracion = '8h') {
    super();
    this.secreto = secreto;
    this.expiracion = expiracion;
  }

  firmar(payload) {
    return jwt.sign(payload, this.secreto, { expiresIn: this.expiracion });
  }

  verificar(token) {
    return jwt.verify(token, this.secreto);
  }
}

module.exports = { BcryptCifradoService, JwtTokenService };
