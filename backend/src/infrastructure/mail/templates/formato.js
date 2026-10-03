'use strict';

const moneda = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n));

const escapar = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ETIQUETA_ESTADO = {
  pendiente: 'Pendiente de Pago',
  pagado: 'Pagado',
  enviado: 'Enviado',
  cancelado: 'Cancelado',
};

const fecha = (valor) =>
  new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(
    valor ? new Date(valor) : new Date()
  );

/** Tabla HTML con el desglose Producto / Cant. / Precio unit. / Subtotal / Total. */
function tablaDesglose(pedido) {
  const filas = pedido.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapar(i.nombreProducto)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.cantidad}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${moneda(i.precioUnitario)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${moneda(i.subtotal)}</td>
      </tr>`
    )
    .join('');

  return `
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f5f5f5;">
        <th style="text-align:left;padding:8px;border-bottom:2px solid #222;">Producto</th>
        <th style="text-align:center;padding:8px;border-bottom:2px solid #222;">Cant.</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #222;">Precio</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #222;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:10px 8px;font-weight:bold;text-align:right;">Total</td>
        <td style="padding:10px 8px;font-weight:bold;text-align:right;">${moneda(pedido.total)}</td>
      </tr>
    </tfoot>
  </table>`;
}

module.exports = { moneda, escapar, ETIQUETA_ESTADO, fecha, tablaDesglose };
