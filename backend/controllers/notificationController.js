const pool = require('../src/config/db')

const listNotifications = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, message, read, created_at
       FROM notifications
       WHERE cognito_sub = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.userId]
    )
    return res.status(200).json({ notifications: rows })
  } catch (error) {
    console.error('Error en listNotifications:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const markNotificationsRead = async (req, res) => {
  try {
    const { ids } = req.body || {}
    const params = [req.userId]
    let filter = 'cognito_sub = $1'

    if (Array.isArray(ids) && ids.length > 0) {
      params.push(ids)
      filter += ' AND id = ANY($2::int[])'
    }

    const { rows } = await pool.query(
      `UPDATE notifications
       SET read = TRUE
       WHERE ${filter}
       RETURNING id, read`,
      params
    )
    return res.status(200).json({ updated: rows.length, notifications: rows })
  } catch (error) {
    console.error('Error en markNotificationsRead:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const registerDevice = async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body
    if (!token) return res.status(400).json({ error: 'El token es obligatorio' })

    const { rows } = await pool.query(
      `INSERT INTO device_tokens (cognito_sub, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (cognito_sub, token)
       DO UPDATE SET platform = EXCLUDED.platform, updated_at = NOW()
       RETURNING id, token, platform, updated_at`,
      [req.userId, token, platform]
    )
    return res.status(200).json({ device: rows[0] })
  } catch (error) {
    console.error('Error en registerDevice:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { listNotifications, markNotificationsRead, registerDevice }
