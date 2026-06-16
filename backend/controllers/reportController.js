const pool = require('../src/config/db')

const getDashboardStats = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE completed = TRUE)::int AS completed,
         COUNT(*) FILTER (WHERE completed = FALSE)::int AS pending,
         COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND completed = FALSE)::int AS overdue
       FROM tareas
       WHERE cognito_sub = $1 AND deleted_at IS NULL`,
      [req.userId]
    )
    return res.status(200).json({ stats: rows[0] })
  } catch (error) {
    console.error('Error en getDashboardStats:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const getWeeklyAnalytics = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         COALESCE(due_date, created_at::date) AS day,
         COUNT(*) FILTER (WHERE completed = TRUE)::int AS completed,
         COUNT(*) FILTER (WHERE completed = FALSE)::int AS pending
       FROM tareas
       WHERE cognito_sub = $1
         AND deleted_at IS NULL
         AND COALESCE(due_date, created_at::date) >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY day
       ORDER BY day ASC`,
      [req.userId]
    )
    return res.status(200).json({ weekly: rows })
  } catch (error) {
    console.error('Error en getWeeklyAnalytics:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const exportTasksCsv = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, notes, category, due_date, completed, created_at
       FROM tareas
       WHERE cognito_sub = $1 AND deleted_at IS NULL
       ORDER BY due_date ASC NULLS LAST`,
      [req.userId]
    )

    const header = ['id', 'title', 'notes', 'category', 'due_date', 'completed', 'created_at']
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const csv = [
      header.join(','),
      ...rows.map((row) => header.map((key) => escapeCsv(row[key])).join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"')
    return res.status(200).send(csv)
  } catch (error) {
    console.error('Error en exportTasksCsv:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const exportTasksPdf = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT title, category, due_date, completed
       FROM tareas
       WHERE cognito_sub = $1 AND completed = TRUE AND deleted_at IS NULL
       ORDER BY due_date DESC NULLS LAST
       LIMIT 50`,
      [req.userId]
    )

    const body = rows
      .map((task) => `${task.title} | ${task.category ?? 'Sin categoria'} | ${task.due_date ?? 'Sin fecha'}`)
      .join('\\n')
    const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length ${body.length + 80} >> stream
BT /F1 12 Tf 40 740 Td (Tareas finalizadas) Tj 0 -24 Td (${body.replace(/[()]/g, '')}) Tj ET
endstream endobj
trailer << /Root 1 0 R >>
%%EOF`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.pdf"')
    return res.status(200).send(Buffer.from(pdf))
  } catch (error) {
    console.error('Error en exportTasksPdf:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getDashboardStats, getWeeklyAnalytics, exportTasksCsv, exportTasksPdf }
