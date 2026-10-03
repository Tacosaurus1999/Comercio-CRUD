import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { pedidoService } from '../../services/pedidoService';

const dinero = (n) => `$${Number(n).toFixed(2)}`;

const ESTADO_CORREO = {
  enviado: { texto: 'Enviado', clase: 'text-accent-green' },
  fallido: { texto: 'No se pudo enviar', clase: 'text-red-400' },
  omitido: { texto: 'No configurado', clase: 'text-text-muted' },
};

/**
 * Checkout en dos pasos:
 *  1) "revisar": resumen del carrito + aviso de pago por transferencia.
 *  2) "listo":   pedido creado en "Pendiente de Pago" + instrucciones bancarias
 *                y estado del correo que el backend envió al cliente.
 */
export default function CheckoutModal({ onCerrar }) {
  const { items, total, vaciar } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [paso, setPaso] = useState('revisar');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [pedido, setPedido] = useState(null); // respuesta del backend

  async function confirmar() {
    setEnviando(true);
    setError(null);
    try {
      const creado = await pedidoService.crear(
        items.map((it) => ({ productoId: it.producto.id, cantidad: it.cantidad }))
      );
      setPedido(creado);
      vaciar();
      setPaso('listo');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el pedido.');
    } finally {
      setEnviando(false);
    }
  }

  function verMisPedidos() {
    onCerrar();
    navigate('/pedidos');
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-base-elevated p-6 shadow-xl">
        {paso === 'revisar' && (
          <>
            <h2 className="text-lg font-bold text-text-primary">Revisa tu pedido</h2>
            <p className="mt-1 text-sm text-text-subdued">
              El pedido se registrará como <strong className="text-text-primary">Pendiente de Pago</strong>.
              Pagas por transferencia bancaria y te enviamos las instrucciones por correo.
            </p>

            <ul className="mt-4 divide-y divide-base-border text-sm">
              {items.map((it) => (
                <li key={it.producto.id} className="flex items-center justify-between py-2">
                  <span className="min-w-0 truncate text-text-primary">
                    {it.producto.nombre} <span className="text-text-subdued">× {it.cantidad}</span>
                  </span>
                  <span className="ml-3 shrink-0 text-text-primary">{dinero(it.producto.precio * it.cantidad)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-base-border pt-3 text-sm">
              <span className="text-text-subdued">Total a transferir</span>
              <span className="text-base font-semibold text-text-primary">{dinero(total)}</span>
            </div>

            <p className="mt-4 rounded bg-base-highlight px-3 py-2 text-xs text-text-subdued">
              📧 Enviaremos el comprobante y los datos bancarios a{' '}
              <strong className="text-text-primary">{usuario?.email}</strong>.
            </p>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCerrar}
                disabled={enviando}
                className="rounded-full border border-base-border px-4 py-2 text-sm text-text-subdued hover:text-text-primary disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={confirmar}
                disabled={enviando || items.length === 0}
                className="rounded-full bg-accent-green px-5 py-2 text-sm font-semibold text-black hover:bg-accent-greenHover disabled:cursor-not-allowed disabled:bg-base-highlight disabled:text-text-muted"
              >
                {enviando ? 'Generando pedido…' : 'Confirmar pedido'}
              </button>
            </div>
          </>
        )}

        {paso === 'listo' && pedido && (
          <>
            <h2 className="text-lg font-bold text-text-primary">¡Pedido #{pedido.id} registrado!</h2>
            <p className="mt-1 text-sm text-text-subdued">
              Estado: <strong className="text-yellow-400">Pendiente de Pago</strong> · Total{' '}
              <strong className="text-text-primary">{dinero(pedido.total)}</strong>
            </p>

            <div className="mt-4 rounded bg-base-highlight p-4 text-sm">
              <h3 className="mb-2 font-semibold text-text-primary">Instrucciones de transferencia</h3>
              <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-text-subdued">
                <dt>Banco</dt>
                <dd className="text-text-primary">{pedido.instruccionesPago.banco}</dd>
                <dt>Beneficiario</dt>
                <dd className="text-text-primary">{pedido.instruccionesPago.beneficiario}</dd>
                <dt>CLABE</dt>
                <dd className="font-mono text-text-primary">{pedido.instruccionesPago.clabe}</dd>
                <dt>Monto</dt>
                <dd className="text-text-primary">{dinero(pedido.total)}</dd>
                <dt>Referencia</dt>
                <dd className="font-mono text-text-primary">{pedido.instruccionesPago.referencia}</dd>
              </dl>
            </div>

            <p className="mt-4 text-xs text-text-subdued">
              Correo con el comprobante a {pedido.notificacion?.destinatario || usuario?.email}:{' '}
              <span className={ESTADO_CORREO[pedido.notificacion?.correoCliente]?.clase}>
                {ESTADO_CORREO[pedido.notificacion?.correoCliente]?.texto || 'Sin información'}
              </span>
            </p>

            {pedido.notificacion?.previewUrl && (
              <a
                href={pedido.notificacion.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-accent-green underline"
              >
                Ver correo de prueba (Ethereal)
              </a>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCerrar}
                className="rounded-full border border-base-border px-4 py-2 text-sm text-text-subdued hover:text-text-primary"
              >
                Seguir comprando
              </button>
              <button
                onClick={verMisPedidos}
                className="rounded-full bg-accent-green px-5 py-2 text-sm font-semibold text-black hover:bg-accent-greenHover"
              >
                Ver mis pedidos
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
