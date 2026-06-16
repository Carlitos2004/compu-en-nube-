const pool = require('../src/config/db')

const createWorkspace = async (req, res) => {
  const client = await pool.connect()
  try {
    const { name, description = null } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

    await client.query('BEGIN')
    const { rows } = await client.query(
      `INSERT INTO workspaces (owner_sub, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, owner_sub, name, description, created_at`,
      [req.userId, name.trim(), description]
    )
    await client.query(
      'INSERT INTO workspace_members (workspace_id, cognito_sub, role) VALUES ($1, $2, $3)',
      [rows[0].id, req.userId, 'admin']
    )
    await client.query('COMMIT')

    return res.status(201).json({ workspace: rows[0] })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en createWorkspace:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    client.release()
  }
}

const inviteToWorkspace = async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email invalido' })

    const { rows: ownerRows } = await pool.query(
      'SELECT id FROM workspaces WHERE id = $1 AND owner_sub = $2',
      [req.params.id, req.userId]
    )
    if (ownerRows.length === 0) return res.status(404).json({ error: 'Workspace no encontrado' })

    const { rows } = await pool.query(
      `INSERT INTO workspace_invites (workspace_id, email, role)
       VALUES ($1, $2, $3)
       RETURNING id, workspace_id, email, role, status, created_at`,
      [req.params.id, email, role]
    )

    return res.status(201).json({ invite: rows[0] })
  } catch (error) {
    console.error('Error en inviteToWorkspace:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateWorkspaceRole = async (req, res) => {
  try {
    const { userId, role } = req.body
    if (!userId || !['reader', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Debes enviar userId y role valido' })
    }

    const { rows: ownerRows } = await pool.query(
      'SELECT id FROM workspaces WHERE id = $1 AND owner_sub = $2',
      [req.params.id, req.userId]
    )
    if (ownerRows.length === 0) return res.status(404).json({ error: 'Workspace no encontrado' })

    const { rows } = await pool.query(
      `INSERT INTO workspace_members (workspace_id, cognito_sub, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, cognito_sub)
       DO UPDATE SET role = EXCLUDED.role
       RETURNING id, workspace_id, cognito_sub, role, created_at`,
      [req.params.id, userId, role]
    )

    return res.status(200).json({ member: rows[0] })
  } catch (error) {
    console.error('Error en updateWorkspaceRole:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { createWorkspace, inviteToWorkspace, updateWorkspaceRole }
