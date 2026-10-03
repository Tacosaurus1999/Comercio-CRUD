'use strict';

/**
 * Puerto del servicio de cifrado. La capa de aplicación solo conoce
 * este contrato; bcryptjs vive detrás del adaptador de infraestructura.
 */
class CifradoServicePort {
  /** @returns {Promise<string>} hash */
  async hashear(_passwordPlano) {
    throw new Error('No implementado: hashear');
  }

  /** @returns {Promise<boolean>} */
  async comparar(_passwordPlano, _hash) {
    throw new Error('No implementado: comparar');
  }
}

/**
 * Puerto de emisión/verificación de tokens de sesión (JWT).
 */
class TokenServicePort {
  firmar(_payload) {
    throw new Error('No implementado: firmar');
  }

  verificar(_token) {
    throw new Error('No implementado: verificar');
  }
}

module.exports = { CifradoServicePort, TokenServicePort };
