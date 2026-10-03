'use strict';

const { moneda, escapar, ETIQUETA_ESTADO, fecha, tablaDesglose } = require('./formato');

/** Plantilla: aviso de nuevo pedido para el administrador. */
function nuevoPedidoAdminTemplate({ pedido, cliente }) {
  const asunto = `🛒 Nuevo pedido #${pedido.id} por ${moneda(pedido.total)}`;

  const texto = [
    `Nuevo pedido #${pedido.id} (${ETIQUETA_ESTADO[pedido.estado]}).`,
    `Cliente: ${cliente.email} (id ${cliente.id})`,
    ...pedido.items.map((i) => `- ${i.nombreProducto} x${i.cantidad}: ${moneda(i.subtotal)}`),
    `Total: ${moneda(pedido.total)}`,
  ].join('\n');

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#222;">
    <h2>Nuevo pedido recibido</h2>
    <p>
      <strong>Pedido #${pedido.id}</strong> · ${fecha(pedido.createdAt)}<br/>
      Cliente: <strong>${escapar(cliente.email)}</strong><br/>
      Estado: <strong style="color:#b45309;">${ETIQUETA_ESTADO[pedido.estado] || escapar(pedido.estado)}</strong>
    </p>
    ${tablaDesglose(pedido)}
    <p style="font-size:13px;color:#555;">
      Cuando verifiques la transferencia, cambia el estado del pedido a "pagado" desde el panel de pedidos.
    </p>
  </div>`;

  return { asunto, texto, html };
}

module.exports = { nuevoPedidoAdminTemplate };
