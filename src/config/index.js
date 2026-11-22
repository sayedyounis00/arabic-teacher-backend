'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const port = parseInt(process.env.PORT || '5000', 10);
const connectionString = process.env.DATABASE_URL;

const needsSsl = connectionString && (
  isProduction ||
  connectionString.includes('railway') ||
  connectionString.includes('supabase') ||
  connectionString.includes('neon.tech') ||
  connectionString.includes('render.com') ||
  connectionString.includes('sslmode=require')
);

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'arabic_platform',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB Pool Error]: Unexpected error on idle client', err);
});

const query = (text, params) => pool.query(text, params);

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    return { ok: true, timestamp: res.rows[0].current_time, database: res.rows[0].db_name };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

module.exports = {
  env,
  port,
  isProduction,
  pool,
  query,
  transaction,
  testConnection,
};
