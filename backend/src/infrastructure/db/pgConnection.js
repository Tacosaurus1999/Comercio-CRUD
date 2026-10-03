'use strict';

const { Pool } = require('pg');

/**
 * Pool de conexiones PostgreSQL, único para toda la aplicación.
 * Se configura vía variables de entorno (ver .env.example).
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_spotify_ui',
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = { pool };
