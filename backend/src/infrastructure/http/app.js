'use strict';

const express = require('express');
const cors = require('cors');

const { pool } = require('../db/pgConnection');

// Repositorios (adaptadores de salida) — PostgreSQL
const { PgUsuarioRepository } = require('../repositories/PgUsuarioRepository');
const { PgProductoRepository } = require('../repositories/PgProductoRepository');
const { PgPedidoRepository } = require('../repositories/PgPedidoRepository');

// Servicios de seguridad
const { BcryptCifradoService, JwtTokenService } = require('../security/BcryptCifradoService');

// Notificaciones (correo)
const { NodemailAdapter } = require('../mail/NodemailAdapter');

// Casos de uso — Usuarios
const {
  RegisterUser,
  LoginUser,
  GetUserProfile,
  ListUsers,
  UpdateUser,
  DeleteUser,
} = require('../../application/useCases/usuarioUseCases');

// Casos de uso — Productos
const {
  GetProductCatalog,
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
} = require('../../application/useCases/productoUseCases');

// Casos de uso — Pedidos
const {
  CreateOrderWithStockCheck,
  GetOrderHistory,
  ListAllOrders,
  UpdateOrderStatus,
  CancelOrder,
  DeleteOrder,
} = require('../../application/useCases/pedidoUseCases');

// Adaptadores de entrada (HTTP)
const { crearAuthController } = require('./controllers/authController');
const { crearUsuarioController } = require('./controllers/usuarioController');
const { crearProductoController } = require('./controllers/productoController');
const { crearPedidoController } = require('./controllers/pedidoController');
const { crearAuthMiddleware, requerirAdmin } = require('./middlewares/authMiddleware');
const { crearAuthRoutes } = require('./routes/authRoutes');
const { crearUsuarioRoutes } = require('./routes/usuarioRoutes');
const { crearProductoRoutes } = require('./routes/productoRoutes');
const { crearPedidoRoutes } = require('./routes/pedidoRoutes');

function crearApp() {
  // --- Adaptadores de infraestructura (PostgreSQL) ---
  const usuarioRepository = new PgUsuarioRepository(pool);
  const productoRepository = new PgProductoRepository(pool);
  const pedidoRepository = new PgPedidoRepository(pool);

  const emailService = new NodemailAdapter(process.env); // implementa EmailServicePort
  const cifradoService = new BcryptCifradoService();
  const tokenService = new JwtTokenService(process.env.JWT_SECRET || 'clave-secreta-desarrollo');

  // --- Casos de uso: Usuarios (CRUD completo) ---
  const registerUser = new RegisterUser(usuarioRepository, cifradoService);
  const loginUser = new LoginUser(usuarioRepository, cifradoService, tokenService);
  const getUserProfile = new GetUserProfile(usuarioRepository);
  const listUsers = new ListUsers(usuarioRepository);
  const updateUser = new UpdateUser(usuarioRepository);
  const deleteUser = new DeleteUser(usuarioRepository);

  // --- Casos de uso: Productos (CRUD completo) ---
  const getProductCatalog = new GetProductCatalog(productoRepository);
  const createProduct = new CreateProduct(productoRepository);
  const updateProduct = new UpdateProduct(productoRepository);
  const deleteProduct = new DeleteProduct(productoRepository);

  // --- Casos de uso: Pedidos (CRUD completo) ---
  const createOrderWithStockCheck = new CreateOrderWithStockCheck(
    pedidoRepository,
    productoRepository,
    usuarioRepository,
    emailService,
    {
      adminEmail: process.env.ADMIN_EMAIL,
      datosBancarios: {
        banco: process.env.BANK_NAME || 'Banco Ejemplo',
        beneficiario: process.env.BANK_BENEFICIARIO || 'Mi Tienda S.A. de C.V.',
        clabe: process.env.BANK_CLABE || '000000000000000000',
      },
    }
  );
  const getOrderHistory = new GetOrderHistory(pedidoRepository);
  const listAllOrders = new ListAllOrders(pedidoRepository);
  const updateOrderStatus = new UpdateOrderStatus(pedidoRepository);
  const cancelOrder = new CancelOrder(pedidoRepository, productoRepository);
  const deleteOrder = new DeleteOrder(pedidoRepository, productoRepository);

  // --- Controladores ---
  const authController = crearAuthController({ registerUser, loginUser, getUserProfile });
  const usuarioController = crearUsuarioController({ listUsers, updateUser, deleteUser });
  const productoController = crearProductoController({
    getProductCatalog,
    createProduct,
    updateProduct,
    deleteProduct,
  });
  const pedidoController = crearPedidoController({
    createOrderWithStockCheck,
    getOrderHistory,
    listAllOrders,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
  });

  const autenticar = crearAuthMiddleware(tokenService);

  // --- App Express ---
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', crearAuthRoutes(authController, autenticar));
  app.use('/api/usuarios', crearUsuarioRoutes(usuarioController, autenticar, requerirAdmin));
  app.use('/api/productos', crearProductoRoutes(productoController, autenticar, requerirAdmin));
  app.use('/api/pedidos', crearPedidoRoutes(pedidoController, autenticar, requerirAdmin));

  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

  return app;
}

module.exports = { crearApp };
