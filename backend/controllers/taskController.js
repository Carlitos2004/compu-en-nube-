const pool = require('../src/config/db')

const mapTask = (task) => ({
  id: task.id,
  title: task.title,
  notes: task.notes,
  category: task.category,
  dueDate: task.due_date,
  completed: task.completed,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
  deletedAt: task.deleted_at
})

const parseTaskId = (id) => {
  const taskId = Number(id)
  return Number.isInteger(taskId) && taskId > 0 ? taskId : null
}

const listTasks = async (req, res) => {
  try {
    const { category, date, sort = 'asc', status, includeDeleted } = req.query
    const values = [req.userId]
    const filters = ['cognito_sub = $1']

    if (includeDeleted !== 'true') {
      filters.push('deleted_at IS NULL')
    }

    if (category) {
      values.push(category)
      filters.push(`category = $${values.length}`)
    }

    if (date) {
      if (!/^\d{4}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'El filtro date debe tener formato YYYY-MM' })
      }

      values.push(`${date}-01`)
      filters.push(`due_date >= $${values.length}::date`)
      values.push(`${date}-01`)
      filters.push(`due_date < ($${values.length}::date + INTERVAL '1 month')`)
    }

    if (status) {
      if (!['completed', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'El status debe ser completed o pending' })
      }

      values.push(status === 'completed')
      filters.push(`completed = $${values.length}`)
    }

    const direction = sort === 'desc' ? 'DESC' : 'ASC'
    const { rows } = await pool.query(
      `SELECT *
       FROM tareas
       WHERE ${filters.join(' AND ')}
       ORDER BY due_date ${direction} NULLS LAST, created_at DESC`,
      values
    )

    return res.status(200).json({ tasks: rows.map(mapTask) })
  } catch (error) {
    console.error('Error en listTasks:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const getTask = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    if (!taskId) {
      return res.status(400).json({ error: 'ID de tarea invalido' })
    }

    const { rows } = await pool.query(
      'SELECT * FROM tareas WHERE id = $1 AND cognito_sub = $2 AND deleted_at IS NULL',
      [taskId, req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    return res.status(200).json({ task: mapTask(rows[0]) })
  } catch (error) {
    console.error('Error en getTask:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const createTask = async (req, res) => {
  try {
    const { title, notes = null, category = null, dueDate = null, completed = false } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'El titulo es obligatorio' })
    }

    const { rows } = await pool.query(
      `INSERT INTO tareas (cognito_sub, title, notes, category, due_date, completed)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.userId, title.trim(), notes, category, dueDate, completed]
    )

    return res.status(201).json({ task: mapTask(rows[0]) })
  } catch (error) {
    console.error('Error en createTask:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateTask = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    if (!taskId) {
      return res.status(400).json({ error: 'ID de tarea invalido' })
    }

    const { title, notes, category, dueDate, completed } = req.body
    if (
      title === undefined &&
      notes === undefined &&
      category === undefined &&
      dueDate === undefined &&
      completed === undefined
    ) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' })
    }

    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ error: 'El titulo no puede estar vacio' })
    }

    const { rows } = await pool.query(
      `UPDATE tareas
       SET title = COALESCE($1, title),
           notes = COALESCE($2, notes),
           category = COALESCE($3, category),
           due_date = COALESCE($4, due_date),
           completed = COALESCE($5, completed),
           updated_at = NOW()
       WHERE id = $6 AND cognito_sub = $7 AND deleted_at IS NULL
       RETURNING *`,
      [
        title === undefined ? null : String(title).trim(),
        notes === undefined ? null : notes,
        category === undefined ? null : category,
        dueDate === undefined ? null : dueDate,
        completed === undefined ? null : completed,
        taskId,
        req.userId
      ]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    return res.status(200).json({ task: mapTask(rows[0]) })
  } catch (error) {
    console.error('Error en updateTask:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateTaskStatus = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    if (!taskId) {
      return res.status(400).json({ error: 'ID de tarea invalido' })
    }

    const { completed } = req.body
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'El campo completed debe ser booleano' })
    }

    const { rows } = await pool.query(
      `UPDATE tareas
       SET completed = $1,
           updated_at = NOW()
       WHERE id = $2 AND cognito_sub = $3 AND deleted_at IS NULL
       RETURNING *`,
      [completed, taskId, req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    return res.status(200).json({ task: mapTask(rows[0]) })
  } catch (error) {
    console.error('Error en updateTaskStatus:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const deleteTask = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    if (!taskId) {
      return res.status(400).json({ error: 'ID de tarea invalido' })
    }

    const { rows } = await pool.query(
      `UPDATE tareas
       SET deleted_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND cognito_sub = $2 AND deleted_at IS NULL
       RETURNING *`,
      [taskId, req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    return res.status(200).json({ mensaje: 'Tarea enviada al basurero', task: mapTask(rows[0]) })
  } catch (error) {
    console.error('Error en deleteTask:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const restoreTask = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    if (!taskId) {
      return res.status(400).json({ error: 'ID de tarea invalido' })
    }

    const { rows } = await pool.query(
      `UPDATE tareas
       SET deleted_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND cognito_sub = $2 AND deleted_at IS NOT NULL
       RETURNING *`,
      [taskId, req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea eliminada no encontrada' })
    }

    return res.status(200).json({ mensaje: 'Tarea restaurada', task: mapTask(rows[0]) })
  } catch (error) {
    console.error('Error en restoreTask:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  restoreTask
}
