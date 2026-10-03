-- ============================================================
-- Esquema de base de datos PostgreSQL - Sistema de comercio electrónico
-- ============================================================

-- Ejecutar conectado ya a la base "ecommerce_spotify_ui"
-- (créala antes con: CREATE DATABASE ecommerce_spotify_ui;)

-- ------------------------------------------------------------
-- Función auxiliar: actualiza updated_at automáticamente
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- Tabla: usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,                 -- hash bcrypt
  rol           VARCHAR(20) NOT NULL DEFAULT 'cliente'
                 CHECK (rol IN ('cliente', 'admin')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Tabla: productos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  precio        NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen_url    VARCHAR(500) DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_productos_updated_at ON productos;
CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Tabla: pedidos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  total         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  estado        VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                 CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'cancelado')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON pedidos;
CREATE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Tabla: pedido_items (relación muchos a muchos pedidos <-> productos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedido_items (
  id                SERIAL PRIMARY KEY,
  pedido_id         INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  producto_id       INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  cantidad          INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario   NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0)
);

-- ------------------------------------------------------------
-- Índices para consultas frecuentes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario   ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_items_pedido      ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_items_producto    ON pedido_items(producto_id);

-- ------------------------------------------------------------
-- Datos semilla (para pruebas rápidas del catálogo)
-- ------------------------------------------------------------
INSERT INTO productos (nombre, precio, stock, imagen_url) VALUES
  ('Teclado mecánico 60%', 899.00, 15, NULL),
  ('Mouse inalámbrico ergonómico', 459.50, 30, NULL),
  ('Monitor 27" 144Hz', 4599.00, 8, NULL),
  ('Audífonos over-ear', 1299.00, 20, NULL),
  ('Hub USB-C 7 puertos', 349.00, 50, NULL)
ON CONFLICT DO NOTHING;
