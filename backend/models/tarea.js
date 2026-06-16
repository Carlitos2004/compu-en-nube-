const pool = require('../src/config/db')

const crearTablaTareas = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tareas (
      id           SERIAL PRIMARY KEY,
      cognito_sub  VARCHAR(255) NOT NULL,
      title        VARCHAR(180) NOT NULL,
      notes        TEXT,
      category     VARCHAR(80),
      due_date     DATE,
      completed    BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW(),
      deleted_at   TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tareas_usuario_deleted
      ON tareas (cognito_sub, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_tareas_usuario_category
      ON tareas (cognito_sub, category);

    CREATE INDEX IF NOT EXISTS idx_tareas_usuario_due_date
      ON tareas (cognito_sub, due_date);
  `

  await pool.query(query)
  console.log('Tabla tareas lista')
}

module.exports = { crearTablaTareas }
