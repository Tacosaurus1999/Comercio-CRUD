'use strict';

const { moneda, escapar, ETIQUETA_ESTADO, fecha, tablaDesglose } = require('./formato');

/** Plantilla: comprobante de compra + instrucciones de pago (cliente). */
function comprobanteClienteTemplate({ pedido, instruccionesPago }) {
  const ip = instruccionesPago;
  const asunto = `Comprobante de tu pedido #${pedido.id} - ${ETIQUETA_ESTADO[pedido.estado] || pedido.estado}`;

  const texto = [
    `Gracias por tu compra. Pedido #${pedido.id} (${ETIQUETA_ESTADO[pedido.estado]}).`,
    ...pedido.items.map((i) => `- ${i.nombreProducto} x${i.cantidad}: ${moneda(i.subtotal)}`),
    `Total: ${moneda(pedido.total)}`,
    '',
    'Instrucciones de pago por transferencia:',
    `Banco: ${ip.banco} | Beneficiario: ${ip.beneficiario} | CLABE: ${ip.clabe}`,
    `Monto: ${moneda(pedido.total)} | Referencia: ${ip.referencia}`,
  ].join('\n');

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#222;">
    <h2 style="margin-bottom:4px;">¡Gracias por tu compra!</h2>
    <p style="margin-top:0;color:#555;">${fecha(pedido.createdAt)}</p>
    <p>
      Tu pedido <strong>#${pedido.id}</strong> fue registrado con estado
      <strong style="color:#b45309;">${ETIQUETA_ESTADO[pedido.estado] || escapar(pedido.estado)}</strong>.
      Se confirmará en cuanto recibamos tu transferencia.
    </p>

    <h3>Desglose de la compra</h3>
    ${tablaDesglose(pedido)}

    <h3>Instrucciones de pago por transferencia bancaria</h3>
    <table style="font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:3px 12px 3px 0;"><strong>Banco</strong></td><td>${escapar(ip.banco)}</td></tr>
      <tr><td style="padding:3px 12px 3px 0;"><strong>Beneficiario</strong></td><td>${escapar(ip.beneficiario)}</td></tr>
      <tr><td style="padding:3px 12px 3px 0;"><strong>CLABE</strong></td><td>${escapar(ip.clabe)}</td></tr>
      <tr><td style="padding:3px 12px 3px 0;"><strong>Monto exacto</strong></td><td>${moneda(pedido.total)}</td></tr>
      <tr><td style="padding:3px 12px 3px 0;"><strong>Referencia</strong></td><td>${escapar(ip.referencia)}</td></tr>
    </table>
    <p style="font-size:13px;color:#555;">
      Usa la referencia como concepto de la transferencia. Cuando la realices, responde a este
      correo adjuntando tu comprobante para que podamos confirmar tu pedido.
    </p>
  </div>`;

  return { asunto, texto, html };
}

module.exports = { comprobanteClienteTemplate };
