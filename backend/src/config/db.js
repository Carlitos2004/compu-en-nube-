const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('✗ Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('✓ Conectado a PostgreSQL exitosamente');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};