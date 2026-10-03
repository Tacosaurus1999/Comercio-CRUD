'use strict';

/**
 * Demo SIN base de datos: crea un pedido en memoria con el MISMO caso de uso y
 * el MISMO adaptador reales, envía los correos a Ethereal (o a Mailtrap si hay
 * SMTP_* en el entorno) e imprime los enlaces para capturar la evidencia.
 * Ejecutar: npm run probar:correo
 */
require('dotenv').config();
const { CreateOrderWithStockCheck } = require('../src/application/useCases/pedidoUseCases');
const { NodemailAdapter } = require('../src/infrastructure/mail/NodemailAdapter');
const { Pedido } = require('../src/domain/entities/Pedido');

const catalogo = {
  1: { id: 1, nombre: 'Audífonos Bluetooth', precio: 899, verificarStockDisponible() {} },
  2: { id: 2, nombre: 'Cable USB-C', precio: 149.5, verificarStockDisponible() {} },
};

(async () => {
  const emailService = new NodemailAdapter(process.env);
  const casoDeUso = new CreateOrderWithStockCheck(
    { crear: async (p) => new Pedido({ id: Date.now() % 100000, usuarioId: p.usuarioId, items: p.items, estado: p.estado, createdAt: new Date() }) },
    { buscarPorId: async (id) => catalogo[id], descontarStockAtomico: async () => true },
    { buscarPorId: async (id) => ({ id, email: 'cliente@example.com' }) },
    emailService,
    { adminEmail: process.env.ADMIN_EMAIL || 'admin@mitienda.test' }
  );

  const r = await casoDeUso.ejecutar(1, [
    { productoId: 1, cantidad: 1 },
    { productoId: 2, cantidad: 2 },
  ]);

  console.log(`\nPedido #${r.id} (${r.estado}) total $${r.total}`);
  console.log('Correo cliente:', r.notificacion.correoCliente, '| Correo admin:', r.notificacion.correoAdmin);
  if (r.notificacion.previewUrl) console.log('Abre en el navegador:', r.notificacion.previewUrl);
})().catch((e) => { console.error(e); process.exit(1); });
