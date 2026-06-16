const pool = require('../src/config/db')

const listCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, color, icon, created_at, updated_at FROM categorias WHERE cognito_sub = $1 ORDER BY name ASC',
      [req.userId]
    )
    return res.status(200).json({ categories: rows })
  } catch (error) {
    console.error('Error en listCategories:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const createCategory = async (req, res) => {
  try {
    const { name, color = null, icon = null } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const { rows } = await pool.query(
      `INSERT INTO categorias (cognito_sub, name, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, color, icon, created_at, updated_at`,
      [req.userId, name.trim(), color, icon]
    )
    return res.status(201).json({ category: rows[0] })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'La categoria ya existe' })
    }
    console.error('Error en createCategory:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body
    const { rows } = await pool.query(
      `UPDATE categorias
       SET name = COALESCE($1, name),
           color = COALESCE($2, color),
           icon = COALESCE($3, icon),
           updated_at = NOW()
       WHERE id = $4 AND cognito_sub = $5
       RETURNING id, name, color, icon, created_at, updated_at`,
      [name ? name.trim() : null, color ?? null, icon ?? null, req.params.id, req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoria no encontrada' })
    }
    return res.status(200).json({ category: rows[0] })
  } catch (error) {
    console.error('Error en updateCategory:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const deleteCategory = async (req, res) => {
  const client = await pool.connect()
  try {
    const { reassignTo = null } = req.body || {}
    await client.query('BEGIN')

    const { rows } = await client.query(
      'SELECT name FROM categorias WHERE id = $1 AND cognito_sub = $2',
      [req.params.id, req.userId]
    )
    if (rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Categoria no encontrada' })
    }

    await client.query(
      'UPDATE tareas SET category = $1, updated_at = NOW() WHERE cognito_sub = $2 AND category = $3',
      [reassignTo, req.userId, rows[0].name]
    )
    await client.query('DELETE FROM categorias WHERE id = $1 AND cognito_sub = $2', [req.params.id, req.userId])
    await client.query('COMMIT')

    return res.status(200).json({ mensaje: 'Categoria eliminada' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en deleteCategory:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    client.release()
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory }
