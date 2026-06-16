const pool = require('../src/config/db')

const crearTablaUsuarios = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id            SERIAL PRIMARY KEY,
      cognito_sub   VARCHAR(255) UNIQUE NOT NULL,
      nombre        VARCHAR(100),
      biografia     TEXT,
      avatar_url    TEXT,
      preferencias  JSONB DEFAULT '{}',
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    );
  `
  await pool.query(query)
  console.log('Tabla usuarios lista')
}

module.exports = { crearTablaUsuarios }