'use strict';

/**
 * Pruebas sin red ni base de datos:
 *  1. El caso de uso solo depende del PUERTO (se prueba con un fake).
 *  2. Un fallo de correo no revierte el pedido.
 *  3. El adaptador se prueba con Nodemailer simulado (stub).
 * Ejecutar: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

// --- Stub de nodemailer (funciona aunque el paquete no esté instalado) ---
const enviados = [];
const nodemailerFalso = {
  createTestAccount: async () => ({ user: 'u@ethereal.email', pass: 'x', smtp: { host: 'h', port: 587, secure: false } }),
  createTransport: () => ({
    sendMail: async (msg) => {
      enviados.push(msg);
      return { messageId: `<${enviados.length}@test>` };
    },
  }),
  getTestMessageUrl: (info) => `https://ethereal.email/message/${info.messageId}`,
};
const cargarOriginal = Module._load;
Module._load = function (request, ...resto) {
  if (request === 'nodemailer') return nodemailerFalso;
  return cargarOriginal.call(this, request, ...resto);
};

const { CreateOrderWithStockCheck } = require('../src/application/useCases/pedidoUseCases');
const { EmailServicePort } = require('../src/application/ports/EmailServicePort');
const { NodemailAdapter } = require('../src/infrastructure/mail/NodemailAdapter');
const { Pedido } = require('../src/domain/entities/Pedido');

// --- Repositorios en memoria ---
const productos = {
  1: { id: 1, nombre: 'Audífonos <Pro>', precio: 899, stock: 5, verificarStockDisponible() {} },
  2: { id: 2, nombre: 'Cable USB-C', precio: 149.5, stock: 10, verificarStockDisponible() {} },
};
const productoRepo = {
  buscarPorId: async (id) => productos[id] || null,
  descontarStockAtomico: async () => true,
};
const pedidoRepo = {
  crear: async (p) => new Pedido({ id: 42, usuarioId: p.usuarioId, items: p.items, estado: p.estado, createdAt: new Date() }),
};
const usuarioRepo = { buscarPorId: async (id) => ({ id, email: 'ana@example.com' }) };

const LINEAS = [
  { productoId: 1, cantidad: 1 },
  { productoId: 2, cantidad: 2 },
];

class EmailFake extends EmailServicePort {
  constructor() { super(); this.llamadas = []; }
  async enviarComprobanteCliente(dest, datos) { this.llamadas.push(['cliente', dest, datos]); return { previewUrl: 'http://preview/1' }; }
  async notificarNuevoPedidoAdmin(dest, datos) { this.llamadas.push(['admin', dest, datos]); return {}; }
}

test('crea el pedido "pendiente" y notifica a cliente y administrador por el puerto', async () => {
  const email = new EmailFake();
  const uc = new CreateOrderWithStockCheck(pedidoRepo, productoRepo, usuarioRepo, email, { adminEmail: 'admin@tienda.test' });
  const r = await uc.ejecutar(7, LINEAS);

  assert.equal(r.estado, 'pendiente');
  assert.equal(r.total, 1198); // 899 + 2 × 149.50
  assert.equal(r.instruccionesPago.referencia, 'PEDIDO-42');
  assert.deepEqual(email.llamadas.map((l) => [l[0], l[1]]), [['cliente', 'ana@example.com'], ['admin', 'admin@tienda.test']]);
  assert.equal(r.notificacion.correoCliente, 'enviado');
  assert.equal(r.notificacion.correoAdmin, 'enviado');
  assert.equal(r.notificacion.previewUrl, 'http://preview/1');
});

test('si el correo falla, el pedido se devuelve igual (no se revierte)', async () => {
  const roto = new EmailFake();
  roto.enviarComprobanteCliente = async () => { throw new Error('SMTP caído'); };
  const silencio = console.error; console.error = () => {};
  const uc = new CreateOrderWithStockCheck(pedidoRepo, productoRepo, usuarioRepo, roto, { adminEmail: 'a@t.test' });
  const r = await uc.ejecutar(7, LINEAS);
  console.error = silencio;

  assert.equal(r.id, 42);
  assert.equal(r.notificacion.correoCliente, 'fallido');
  assert.equal(r.notificacion.correoAdmin, 'enviado');
});

test('sin puerto de correo configurado el caso de uso sigue funcionando', async () => {
  const uc = new CreateOrderWithStockCheck(pedidoRepo, productoRepo);
  const r = await uc.ejecutar(7, LINEAS);
  assert.equal(r.notificacion.correoCliente, 'omitido');
});

test('NodemailAdapter: arma los dos correos con desglose, total e instrucciones', async () => {
  enviados.length = 0;
  const adapter = new NodemailAdapter({ MAIL_FROM: '"Tienda" <t@t.test>' });
  const email = adapter;
  const uc = new CreateOrderWithStockCheck(pedidoRepo, productoRepo, usuarioRepo, email, {
    adminEmail: 'admin@tienda.test',
    datosBancarios: { banco: 'BBVA', beneficiario: 'Mi Tienda', clabe: '012345678901234567' },
  });
  const r = await uc.ejecutar(7, LINEAS);

  assert.equal(enviados.length, 2);
  const [cliente, admin] = enviados;
  assert.equal(cliente.to, 'ana@example.com');
  assert.match(cliente.subject, /Pedido #42|pedido #42/i);
  assert.match(cliente.html, /Pendiente de Pago/);
  assert.match(cliente.html, /012345678901234567/);
  assert.match(cliente.html, /PEDIDO-42/);
  assert.match(cliente.html, /Audífonos &lt;Pro&gt;/); // HTML escapado
  assert.equal(admin.to, 'admin@tienda.test');
  assert.match(admin.html, /ana@example\.com/);
  assert.match(r.notificacion.previewUrl, /ethereal\.email\/message/);
});
