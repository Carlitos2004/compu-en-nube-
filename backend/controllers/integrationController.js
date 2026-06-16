const pool = require('../src/config/db')

const formatIcsDate = (date) => {
  if (!date) return null
  return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

const syncCalendar = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, notes, due_date
       FROM tareas
       WHERE cognito_sub = $1 AND due_date IS NOT NULL AND deleted_at IS NULL
       ORDER BY due_date ASC`,
      [req.userId]
    )

    const events = rows.map((task) => {
      const start = formatIcsDate(task.due_date)
      return [
        'BEGIN:VEVENT',
        `UID:task-${task.id}@cloudtask`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${start}`,
        `SUMMARY:${task.title}`,
        `DESCRIPTION:${task.notes ?? ''}`,
        'END:VEVENT'
      ].join('\r\n')
    })

    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CloudTask//Tasks//ES', ...events, 'END:VCALENDAR'].join('\r\n')
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    return res.status(200).send(ics)
  } catch (error) {
    console.error('Error en syncCalendar:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const createWebhook = async (req, res) => {
  try {
    const { url, event = 'task.completed', active = true } = req.body
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: 'URL invalida' })
    }

    const { rows } = await pool.query(
      `INSERT INTO webhooks (cognito_sub, url, event, active)
       VALUES ($1, $2, $3, $4)
       RETURNING id, url, event, active, created_at`,
      [req.userId, url, event, active]
    )
    return res.status(201).json({ webhook: rows[0] })
  } catch (error) {
    console.error('Error en createWebhook:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { syncCalendar, createWebhook }
