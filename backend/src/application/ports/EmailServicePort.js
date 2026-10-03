'use strict';

/**
 * PUERTO DE SALIDA — EmailServicePort
 *
 * Contrato que la capa de Aplicación necesita para comunicarse por correo.
 * No menciona Nodemailer, SMTP ni ningún proveedor: solo QUÉ se quiere
 * notificar. La implementación concreta vive en infrastructure/mail.
 *
 * Forma de `datos` en ambos métodos:
 *   {
 *     pedido:           objeto serializado del pedido (id, estado, total, items[], createdAt),
 *     cliente:          { id, email },
 *     instruccionesPago:{ banco, beneficiario, clabe, referencia }
 *   }
 *
 * @typedef {{ previewUrl?: string|false, messageId?: string }} ResultadoEnvio
 */
class EmailServicePort {
  /**
   * Envía al cliente el comprobante de compra + instrucciones de pago.
   * @returns {Promise<ResultadoEnvio>}
   */
  async enviarComprobanteCliente(_destinatario, _datos) {
    throw new Error('No implementado: enviarComprobanteCliente');
  }

  /**
   * Avisa al administrador de que llegó un nuevo pedido.
   * @returns {Promise<ResultadoEnvio>}
   */
  async notificarNuevoPedidoAdmin(_destinatario, _datos) {
    throw new Error('No implementado: notificarNuevoPedidoAdmin');
  }
}

module.exports = { EmailServicePort };
