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

const ensureTaskOwner = async (taskId, userId, includeDeleted = false) => {
  const deletedFilter = includeDeleted ? '' : 'AND deleted_at IS NULL'
  const { rows } = await pool.query(
    `SELECT id FROM tareas WHERE id = $1 AND cognito_sub = $2 ${deletedFilter}`,
    [taskId, userId]
  )
  return rows.length > 0
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
    
    const updates = {}
    if (title !== undefined) updates.title = title.trim()
    if (notes !== undefined) updates.notes = notes
    if (category !== undefined) updates.category = category
    if (dueDate !== undefined) updates.due_date = dueDate
    if (completed !== undefined) updates.completed = completed

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' })
    }

    if (updates.title !== undefined && !updates.title) {
      return res.status(400).json({ error: 'El titulo no puede estar vacio' })
    }

    const fields = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ')

    const { rows } = await pool.query(
      `UPDATE tareas
       SET ${setClause},
           updated_at = NOW()
       WHERE id = $${fields.length + 1} AND cognito_sub = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, taskId, req.userId]
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

const createSubtask = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    const { title } = req.body
    if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })
    if (!title || !title.trim()) return res.status(400).json({ error: 'El titulo es obligatorio' })

    const hasTask = await ensureTaskOwner(taskId, req.userId)
    if (!hasTask) return res.status(404).json({ error: 'Tarea no encontrada' })

    const { rows } = await pool.query(
      `INSERT INTO subtareas (task_id, title)
       VALUES ($1, $2)
       RETURNING id, task_id, title, completed, created_at, updated_at`,
      [taskId, title.trim()]
    )
    return res.status(201).json({ subtask: rows[0] })
  } catch (error) {
    console.error('Error en createSubtask:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateSubtask = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    const subtaskId = parseTaskId(req.params.subId)
    const { title, completed } = req.body
    if (!taskId || !subtaskId) return res.status(400).json({ error: 'ID invalido' })

    const hasTask = await ensureTaskOwner(taskId, req.userId)
    if (!hasTask) return res.status(404).json({ error: 'Tarea no encontrada' })

    const { rows } = await pool.query(
      `UPDATE subtareas
       SET title = COALESCE($1, title),
           completed = COALESCE($2, completed),
           updated_at = NOW()
       WHERE id = $3 AND task_id = $4
       RETURNING id, task_id, title, completed, created_at, updated_at`,
      [title ? title.trim() : null, completed === undefined ? null : completed, subtaskId, taskId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Subtarea no encontrada' })

    return res.status(200).json({ subtask: rows[0] })
  } catch (error) {
    console.error('Error en updateSubtask:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const uploadAttachment = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })
    if (!req.file) return res.status(400).json({ error: 'Debes adjuntar un archivo' })

    const hasTask = await ensureTaskOwner(taskId, req.userId)
    if (!hasTask) return res.status(404).json({ error: 'Tarea no encontrada' })

    const fileName = req.file.originalname
    const s3Key = `tasks/${req.userId}/${taskId}/${Date.now()}-${fileName}`
    const fileUrl = process.env.S3_BUCKET_NAME
      ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`
      : `local://${s3Key}`

    const { rows } = await pool.query(
      `INSERT INTO task_attachments (task_id, file_name, file_url, mime_type, size_bytes, s3_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, task_id, file_name, file_url, mime_type, size_bytes, created_at`,
      [taskId, fileName, fileUrl, req.file.mimetype, req.file.size, s3Key]
    )

    return res.status(201).json({ attachment: rows[0] })
  } catch (error) {
    console.error('Error en uploadAttachment:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const deleteAttachment = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    const attachmentId = parseTaskId(req.params.attId)
    if (!taskId || !attachmentId) return res.status(400).json({ error: 'ID invalido' })

    const hasTask = await ensureTaskOwner(taskId, req.userId, true)
    if (!hasTask) return res.status(404).json({ error: 'Tarea no encontrada' })

    const { rows } = await pool.query(
      `DELETE FROM task_attachments
       WHERE id = $1 AND task_id = $2
       RETURNING id, file_name`,
      [attachmentId, taskId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Adjunto no encontrado' })

    return res.status(200).json({ mensaje: 'Adjunto eliminado', attachment: rows[0] })
  } catch (error) {
    console.error('Error en deleteAttachment:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const bulkComplete = async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Debes enviar un arreglo de ids' })
    }

    const { rows } = await pool.query(
      `UPDATE tareas
       SET completed = TRUE,
           updated_at = NOW()
       WHERE cognito_sub = $1 AND id = ANY($2::int[]) AND deleted_at IS NULL
       RETURNING id, title, completed`,
      [req.userId, ids]
    )

    return res.status(200).json({ updated: rows.length, tasks: rows })
  } catch (error) {
    console.error('Error en bulkComplete:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const bulkDelete = async (req, res) => {
  try {
    const { ids, emptyTrash = false } = req.body || {}

    if (emptyTrash) {
      const { rowCount } = await pool.query(
        'DELETE FROM tareas WHERE cognito_sub = $1 AND deleted_at IS NOT NULL',
        [req.userId]
      )
      return res.status(200).json({ deleted: rowCount })
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Debes enviar ids o emptyTrash=true' })
    }

    const { rows } = await pool.query(
      `UPDATE tareas
       SET deleted_at = NOW(),
           updated_at = NOW()
       WHERE cognito_sub = $1 AND id = ANY($2::int[]) AND deleted_at IS NULL
       RETURNING id, title, deleted_at`,
      [req.userId, ids]
    )

    return res.status(200).json({ deleted: rows.length, tasks: rows })
  } catch (error) {
    console.error('Error en bulkDelete:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const createComment = async (req, res) => {
  try {
    const taskId = parseTaskId(req.params.id)
    const { comment } = req.body
    if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })
    if (!comment || !comment.trim()) return res.status(400).json({ error: 'El comentario es obligatorio' })

    const hasTask = await ensureTaskOwner(taskId, req.userId)
    if (!hasTask) return res.status(404).json({ error: 'Tarea no encontrada' })

    const { rows } = await pool.query(
      `INSERT INTO task_comments (task_id, cognito_sub, comment)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, cognito_sub, comment, created_at`,
      [taskId, req.userId, comment.trim()]
    )

    return res.status(201).json({ comment: rows[0] })
  } catch (error) {
    console.error('Error en createComment:', error)
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
  restoreTask,
  createSubtask,
  updateSubtask,
  uploadAttachment,
  deleteAttachment,
  bulkComplete,
  bulkDelete,
  createComment
}
