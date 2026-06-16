const db = require('../src/config/db');

// GET /api/tasks -> Obtiene todas las tareas (ahora incluye notas)
const getTasks = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks ORDER BY id DESC');
    
    const formattedTasks = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      completed: row.completed,
      dueDate: row.due_date,
      notes: row.notes // <-- ¡Ahora enviamos las notas al frontend!
    }));

    res.status(200).json({ status: 'success', data: formattedTasks });
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/tasks -> Crea una nueva tarea (ahora incluye fecha y notas)
const createTask = async (req, res) => {
  try {
    // Recibimos todos los campos del frontend
    const { title, category, dueDate, notes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título de la tarea es obligatorio' });
    }

    // Insertamos incluyendo due_date y notes
    const result = await db.query(
      'INSERT INTO tasks (title, category, due_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, category || 'General', dueDate || null, notes || '']
    );

    const newTask = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      category: result.rows[0].category,
      completed: result.rows[0].completed,
      dueDate: result.rows[0].due_date,
      notes: result.rows[0].notes // <-- Devolvemos la nota guardada
    };

    res.status(201).json({ status: 'success', data: newTask });
  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getTasks,
  createTask
};
// PUT /api/tasks/:id -> Actualiza una tarea (Edición o Marcar como completada)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, dueDate, notes, completed } = req.body;

    const result = await db.query(
      `UPDATE tasks 
       SET title = $1, category = $2, due_date = $3, notes = $4, completed = $5 
       WHERE id = $6 RETURNING *`,
      [title, category, dueDate || null, notes || '', completed, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.status(200).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/tasks/:id -> Elimina una tarea permanentemente
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.status(200).json({ status: 'success', message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// No olvides exportarlas:
module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};