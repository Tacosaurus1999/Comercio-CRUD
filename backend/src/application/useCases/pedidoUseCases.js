'use strict';

const { Pedido, PedidoItem, ESTADOS_VALIDOS } = require('../../domain/entities/Pedido');
const { DomainError } = require('../../domain/errors/DomainError');

/**
 * Caso de uso: CreateOrderWithStockCheck (Create)
 * Orquesta:
 *   1. Cargar cada producto solicitado.
 *   2. Verificar stock disponible (regla de dominio de Producto).
 *   3. Calcular el total exacto (regla de dominio de Pedido).
 *   4. Descontar stock de forma atómica y persistir el pedido.
 *   5. Notificar por correo (vía EmailServicePort): comprobante al cliente
 *      y aviso al administrador.
 */
class CreateOrderWithStockCheck {
  /**
   * @param {PedidoRepositoryPort} pedidoRepository
   * @param {ProductoRepositoryPort} productoRepository
   * @param {UsuarioRepositoryPort|null} usuarioRepository
   * @param {EmailServicePort|null} emailService  puerto de correo (nunca Nodemailer directamente)
   * @param {{ adminEmail?: string, datosBancarios?: Object }} config
   */
  constructor(pedidoRepository, productoRepository, usuarioRepository = null, emailService = null, config = {}) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
    this.emailService = emailService;
    this.adminEmail = config.adminEmail || null;
    this.datosBancarios = config.datosBancarios || {
      banco: 'Banco Ejemplo',
      beneficiario: 'Mi Tienda S.A. de C.V.',
      clabe: '000000000000000000',
    };
  }

  async ejecutar(usuarioId, lineasSolicitadas) {
    if (!Array.isArray(lineasSolicitadas) || lineasSolicitadas.length === 0) {
      throw new DomainError('Debes incluir al menos un producto en el pedido.');
    }

    const items = [];

    for (const linea of lineasSolicitadas) {
      const producto = await this.productoRepository.buscarPorId(linea.productoId);
      if (!producto) {
        throw new DomainError(`El producto con id ${linea.productoId} no existe.`, 'PRODUCTO_NO_ENCONTRADO');
      }
      producto.verificarStockDisponible(linea.cantidad);

      items.push(
        new PedidoItem({
          productoId: producto.id,
          nombreProducto: producto.nombre,
          cantidad: linea.cantidad,
          precioUnitario: producto.precio,
        })
      );
    }

    // Estado inicial: "pendiente" (se muestra como "Pendiente de Pago").
    const pedido = new Pedido({ usuarioId, items, estado: 'pendiente' });
    pedido.calcularTotal();

    for (const item of items) {
      const descontado = await this.productoRepository.descontarStockAtomico(item.productoId, item.cantidad);
      if (!descontado) {
        throw new DomainError(
          `Stock insuficiente para "${item.nombreProducto}" al momento de confirmar el pedido.`,
          'STOCK_INSUFICIENTE'
        );
      }
    }

    const pedidoCreado = await this.pedidoRepository.crear(pedido);
    const pedidoJSON = pedidoCreado.toJSON();
    const instruccionesPago = { ...this.datosBancarios, referencia: `PEDIDO-${pedidoJSON.id}` };

    const notificacion = await this._notificar(usuarioId, pedidoJSON, instruccionesPago);
    return { ...pedidoJSON, instruccionesPago, notificacion };
  }

  /**
   * Los correos son un efecto secundario: si fallan, el pedido ya persistido
   * NO se revierte; solo se informa el resultado en `notificacion`.
   */
  async _notificar(usuarioId, pedido, instruccionesPago) {
    const resultado = { correoCliente: 'omitido', correoAdmin: 'omitido', destinatario: null, previewUrl: null };
    if (!this.emailService || !this.usuarioRepository) return resultado;

    let cliente;
    try {
      const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
      if (!usuario) return resultado;
      cliente = { id: usuario.id, email: usuario.email };
    } catch (error) {
      console.error('⚠️ No se pudo cargar al cliente para notificar:', error.message);
      return resultado;
    }

    resultado.destinatario = cliente.email;
    const datos = { pedido, cliente, instruccionesPago };

    const tareas = [this.emailService.enviarComprobanteCliente(cliente.email, datos)];
    if (this.adminEmail) tareas.push(this.emailService.notificarNuevoPedidoAdmin(this.adminEmail, datos));

    const [rCliente, rAdmin] = await Promise.allSettled(tareas);

    if (rCliente.status === 'fulfilled') {
      resultado.correoCliente = 'enviado';
      resultado.previewUrl = rCliente.value?.previewUrl || null;
    } else {
      resultado.correoCliente = 'fallido';
      console.error(`⚠️ Falló el correo al cliente (pedido #${pedido.id}):`, rCliente.reason?.message);
    }

    if (rAdmin) {
      if (rAdmin.status === 'fulfilled') resultado.correoAdmin = 'enviado';
      else {
        resultado.correoAdmin = 'fallido';
        console.error(`⚠️ Falló el correo al administrador (pedido #${pedido.id}):`, rAdmin.reason?.message);
      }
    }

    return resultado;
  }
}

/** Caso de uso: GetOrderHistory (Read — pedidos del usuario autenticado) */
class GetOrderHistory {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async ejecutar(usuarioId) {
    const pedidos = await this.pedidoRepository.listarPorUsuario(usuarioId);
    return pedidos.map((p) => p.toJSON());
  }
}

/** Caso de uso: ListAllOrders (Read administrativo — todos los pedidos) */
class ListAllOrders {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async ejecutar() {
    const pedidos = await this.pedidoRepository.listarTodos();
    return pedidos.map((p) => p.toJSON());
  }
}

/** Caso de uso: UpdateOrderStatus (Update — uso administrativo) */
class UpdateOrderStatus {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async ejecutar(pedidoId, nuevoEstado) {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      throw new DomainError(`Estado de pedido inválido: ${nuevoEstado}.`);
    }

    const pedido = await this.pedidoRepository.buscarPorId(pedidoId);
    if (!pedido) {
      throw new DomainError('Pedido no encontrado.', 'PEDIDO_NO_ENCONTRADO');
    }
    if (pedido.estado === 'cancelado') {
      throw new DomainError('No se puede modificar un pedido ya cancelado.', 'PEDIDO_CANCELADO');
    }

    pedido.cambiarEstado(nuevoEstado); // valida la transición en el dominio
    const actualizado = await this.pedidoRepository.actualizarEstado(pedidoId, nuevoEstado);
    return actualizado.toJSON();
  }
}

/**
 * Caso de uso: CancelOrder (Update/"Delete" lógico — el propio usuario cancela
 * su pedido mientras esté "pendiente" y se le reingresa el stock reservado).
 */
class CancelOrder {
  constructor(pedidoRepository, productoRepository) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
  }

  async ejecutar(pedidoId, usuarioId) {
    const pedido = await this.pedidoRepository.buscarPorId(pedidoId);
    if (!pedido) {
      throw new DomainError('Pedido no encontrado.', 'PEDIDO_NO_ENCONTRADO');
    }
    if (pedido.usuarioId !== usuarioId) {
      throw new DomainError('No puedes cancelar un pedido que no te pertenece.', 'PEDIDO_AJENO');
    }
    if (pedido.estado !== 'pendiente') {
      throw new DomainError('Solo se pueden cancelar pedidos en estado "pendiente".', 'ESTADO_INVALIDO');
    }

    for (const item of pedido.items) {
      await this.productoRepository.incrementarStock(item.productoId, item.cantidad);
    }

    const actualizado = await this.pedidoRepository.actualizarEstado(pedidoId, 'cancelado');
    return actualizado.toJSON();
  }
}

/** Caso de uso: DeleteOrder (Delete físico — uso administrativo) */
class DeleteOrder {
  constructor(pedidoRepository, productoRepository) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
  }

  async ejecutar(pedidoId) {
    const pedido = await this.pedidoRepository.buscarPorId(pedidoId);
    if (!pedido) {
      throw new DomainError('Pedido no encontrado.', 'PEDIDO_NO_ENCONTRADO');
    }

    // Si el pedido no estaba ya cancelado, reingresamos el stock antes de borrarlo.
    if (pedido.estado !== 'cancelado') {
      for (const item of pedido.items) {
        await this.productoRepository.incrementarStock(item.productoId, item.cantidad);
      }
    }

    await this.pedidoRepository.eliminar(pedidoId);
    return { id: pedidoId };
  }
}

module.exports = {
  CreateOrderWithStockCheck,
  GetOrderHistory,
  ListAllOrders,
  UpdateOrderStatus,
  CancelOrder,
  DeleteOrder,
};
