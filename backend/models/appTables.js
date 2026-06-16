const pool = require('../src/config/db')

const crearTablasComplementarias = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      cognito_sub VARCHAR(255) NOT NULL,
      name VARCHAR(80) NOT NULL,
      color VARCHAR(20),
      icon VARCHAR(80),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (cognito_sub, name)
    );

    CREATE TABLE IF NOT EXISTS subtareas (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
      title VARCHAR(180) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS task_attachments (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      mime_type VARCHAR(120),
      size_bytes INTEGER,
      s3_key TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id SERIAL PRIMARY KEY,
      owner_sub VARCHAR(255) NOT NULL,
      name VARCHAR(120) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      cognito_sub VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'editor',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (workspace_id, cognito_sub)
    );

    CREATE TABLE IF NOT EXISTS workspace_invites (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'editor',
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
      cognito_sub VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      cognito_sub VARCHAR(255) NOT NULL,
      title VARCHAR(160) NOT NULL,
      message TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS device_tokens (
      id SERIAL PRIMARY KEY,
      cognito_sub VARCHAR(255) NOT NULL,
      token TEXT NOT NULL,
      platform VARCHAR(60),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (cognito_sub, token)
    );

    CREATE TABLE IF NOT EXISTS webhooks (
      id SERIAL PRIMARY KEY,
      cognito_sub VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      event VARCHAR(80) NOT NULL DEFAULT 'task.completed',
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `

  await pool.query(query)
  console.log('Tablas complementarias listas')
}

module.exports = { crearTablasComplementarias }
