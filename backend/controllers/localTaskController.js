const addDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const now = () => new Date().toISOString()

let tasks = [
  { id: 101, title: 'Configurar Keycloak y Docker', notes: 'Entorno de desarrollo local levantado', category: 'Trabajo', dueDate: '2026-03-15', completed: true },
  { id: 102, title: 'Torneo Tenis de Mesa', notes: 'Fase de grupos', category: 'Salud', dueDate: '2026-04-10', completed: true },
  { id: 103, title: 'Hito 0 - Planificacion', notes: 'Entrega de Excel y roles definidos', category: 'Trabajo', dueDate: '2026-04-05', completed: true },
  { id: 104, title: 'Reunion Grupo 3', notes: 'Coordinar maquetacion y UI/UX del panel', category: 'Trabajo', dueDate: '2026-05-15', completed: false },
  { id: 105, title: 'Migrar base de datos a Neon', notes: 'Revisar modelos SQLAlchemy', category: 'Trabajo', dueDate: addDays(0), completed: false },
  { id: 106, title: 'Pagar mensualidad', notes: 'Transferencia portal alumno', category: 'Personal', dueDate: addDays(1), completed: false },
  { id: 107, title: 'Comprar zapatillas deportivas', notes: 'Para los entrenamientos de la semana', category: 'Compras', dueDate: '2026-05-28', completed: false },
  { id: 108, title: 'Corte de pelo (Taper fade)', notes: 'Pedir hora con el barbero', category: 'Personal', dueDate: '2026-06-05', completed: false },
  { id: 109, title: 'Hito 6 - Defensa Final', notes: 'Presentacion del proyecto', category: 'Trabajo', dueDate: '2026-07-08', completed: false },
  { id: 110, title: 'Reunion con cliente WellQ', notes: 'Validar dashboard administrativo', category: 'Trabajo', dueDate: '2026-06-15', completed: false },
  { id: 111, title: 'Prueba recuperativa', notes: 'Repasar estructuras de datos', category: 'Trabajo', dueDate: '2026-06-25', completed: false },
  { id: 112, title: 'Renovar suscripcion servidores', notes: 'Hosting y dominios', category: 'Compras', dueDate: '2026-08-10', completed: false }
].map((task) => ({
  ...task,
  createdAt: now(),
  updatedAt: now(),
  deletedAt: null
}))

let nextTaskId = Math.max(...tasks.map((task) => task.id)) + 1

const parseTaskId = (id) => {
  const taskId = Number(id)
  return Number.isInteger(taskId) && taskId > 0 ? taskId : null
}

const findTask = (id, includeDeleted = false) =>
  tasks.find((task) => task.id === id && (includeDeleted || !task.deletedAt))

const visibleTasks = (includeDeleted = false) =>
  tasks.filter((task) => includeDeleted || !task.deletedAt)

const sortByDueDate = (items, sort = 'asc') => {
  const direction = sort === 'desc' ? -1 : 1
  return [...items].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return b.id - a.id
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate) * direction || b.id - a.id
  })
}

const listTasks = (req, res) => {
  const { category, date, sort = 'asc', status, includeDeleted } = req.query
  let result = visibleTasks(includeDeleted === 'true')

  if (category) {
    result = result.filter((task) => task.category === category)
  }

  if (date) {
    if (!/^\d{4}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'El filtro date debe tener formato YYYY-MM' })
    }

    result = result.filter((task) => task.dueDate && task.dueDate.startsWith(date))
  }

  if (status) {
    if (!['completed', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'El status debe ser completed o pending' })
    }

    result = result.filter((task) => task.completed === (status === 'completed'))
  }

  return res.status(200).json({ tasks: sortByDueDate(result, sort) })
}

const getTask = (req, res) => {
  const taskId = parseTaskId(req.params.id)
  if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })

  const task = findTask(taskId)
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' })

  return res.status(200).json({ task })
}

const createTask = (req, res) => {
  const { title, notes = '', category = 'Personal', dueDate = null, completed = false } = req.body

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'El titulo es obligatorio' })
  }

  const task = {
    id: nextTaskId++,
    title: String(title).trim(),
    notes,
    category,
    dueDate,
    completed: Boolean(completed),
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null
  }

  tasks = [task, ...tasks]
  return res.status(201).json({ task })
}

const updateTask = (req, res) => {
  const taskId = parseTaskId(req.params.id)
  if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })

  const task = findTask(taskId)
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' })

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

  const updatedTask = {
    ...task,
    title: title === undefined ? task.title : String(title).trim(),
    notes: notes === undefined ? task.notes : notes,
    category: category === undefined ? task.category : category,
    dueDate: dueDate === undefined ? task.dueDate : dueDate,
    completed: completed === undefined ? task.completed : Boolean(completed),
    updatedAt: now()
  }

  tasks = tasks.map((item) => (item.id === taskId ? updatedTask : item))
  return res.status(200).json({ task: updatedTask })
}

const updateTaskStatus = (req, res) => {
  const taskId = parseTaskId(req.params.id)
  if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })
  if (typeof req.body.completed !== 'boolean') {
    return res.status(400).json({ error: 'El campo completed debe ser booleano' })
  }

  req.body = { completed: req.body.completed }
  return updateTask(req, res)
}

const deleteTask = (req, res) => {
  const taskId = parseTaskId(req.params.id)
  if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })

  const task = findTask(taskId)
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' })

  const deletedTask = { ...task, deletedAt: now(), updatedAt: now() }
  tasks = tasks.map((item) => (item.id === taskId ? deletedTask : item))
  return res.status(200).json({ mensaje: 'Tarea enviada al basurero', task: deletedTask })
}

const restoreTask = (req, res) => {
  const taskId = parseTaskId(req.params.id)
  if (!taskId) return res.status(400).json({ error: 'ID de tarea invalido' })

  const task = findTask(taskId, true)
  if (!task || !task.deletedAt) {
    return res.status(404).json({ error: 'Tarea eliminada no encontrada' })
  }

  const restoredTask = { ...task, deletedAt: null, updatedAt: now() }
  tasks = tasks.map((item) => (item.id === taskId ? restoredTask : item))
  return res.status(200).json({ mensaje: 'Tarea restaurada', task: restoredTask })
}

const bulkComplete = (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Debes enviar un arreglo de ids' })
  }

  const idSet = new Set(ids.map(Number))
  let updated = 0
  tasks = tasks.map((task) => {
    if (!idSet.has(task.id) || task.deletedAt) return task
    updated += 1
    return { ...task, completed: true, updatedAt: now() }
  })

  return res.status(200).json({ updated, tasks: tasks.filter((task) => idSet.has(task.id)) })
}

const bulkDelete = (req, res) => {
  const { ids, emptyTrash = false } = req.body || {}

  if (emptyTrash) {
    const before = tasks.length
    tasks = tasks.filter((task) => !task.deletedAt)
    return res.status(200).json({ deleted: before - tasks.length })
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Debes enviar ids o emptyTrash=true' })
  }

  const idSet = new Set(ids.map(Number))
  let deleted = 0
  tasks = tasks.map((task) => {
    if (!idSet.has(task.id) || task.deletedAt) return task
    deleted += 1
    return { ...task, deletedAt: now(), updatedAt: now() }
  })

  return res.status(200).json({ deleted })
}

const notImplemented = (_req, res) =>
  res.status(501).json({ error: 'Endpoint no disponible en modo local de tareas' })

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  restoreTask,
  createSubtask: notImplemented,
  updateSubtask: notImplemented,
  uploadAttachment: notImplemented,
  deleteAttachment: notImplemented,
  bulkComplete,
  bulkDelete,
  createComment: notImplemented
}
