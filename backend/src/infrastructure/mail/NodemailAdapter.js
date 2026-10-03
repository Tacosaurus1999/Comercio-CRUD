'use strict';

const nodemailer = require('nodemailer');
const { EmailServicePort } = require('../../application/ports/EmailServicePort');
const { comprobanteClienteTemplate } = require('./templates/comprobanteClienteTemplate');
const { nuevoPedidoAdminTemplate } = require('./templates/nuevoPedidoAdminTemplate');

/**
 * ADAPTADOR DE SALIDA — NodemailAdapter implements EmailServicePort
 *
 * Es el ÚNICO archivo del sistema que conoce Nodemailer.
 *  - Con SMTP_HOST definido usa ese servidor (p. ej. Mailtrap).
 *  - Sin SMTP_HOST genera una cuenta de pruebas en Ethereal (createTestAccount).
 */
class NodemailAdapter extends EmailServicePort {
  constructor(env = process.env) {
    super();
    this.env = env;
    this.transporterPromise = null;
  }

  _obtenerTransporter() {
    if (!this.transporterPromise) {
      this.transporterPromise = (async () => {
        if (this.env.SMTP_HOST) {
          return nodemailer.createTransport({
            host: this.env.SMTP_HOST,
            port: Number(this.env.SMTP_PORT || 587),
            secure: this.env.SMTP_SECURE === 'true',
            auth: { user: this.env.SMTP_USER, pass: this.env.SMTP_PASS },
          });
        }
        const cuenta = await nodemailer.createTestAccount();
        console.log(`📧 Cuenta Ethereal generada (usuario: ${cuenta.user})`);
        return nodemailer.createTransport({
          host: cuenta.smtp.host,
          port: cuenta.smtp.port,
          secure: cuenta.smtp.secure,
          auth: { user: cuenta.user, pass: cuenta.pass },
        });
      })().catch((error) => {
        this.transporterPromise = null; // permite reintentar en el siguiente envío
        throw error;
      });
    }
    return this.transporterPromise;
  }

  async _enviar(destinatario, { asunto, texto, html }) {
    const transporter = await this._obtenerTransporter();
    const info = await transporter.sendMail({
      from: this.env.MAIL_FROM || '"Mi Tienda" <no-reply@mitienda.test>',
      to: destinatario,
      subject: asunto,
      text: texto,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info); // false si no es Ethereal
    if (previewUrl) console.log(`📧 Vista previa (${asunto}): ${previewUrl}`);
    return { messageId: info.messageId, previewUrl };
  }

  enviarComprobanteCliente(destinatario, datos) {
    return this._enviar(destinatario, comprobanteClienteTemplate(datos));
  }

  notificarNuevoPedidoAdmin(destinatario, datos) {
    return this._enviar(destinatario, nuevoPedidoAdminTemplate(datos));
  }
}

module.exports = { NodemailAdapter };
