/**
 * Notification Controller
 * SRP: Maneja el listado, lectura y registro de dispositivos para notificaciones (PostgreSQL)
 */

// Importamos la conexión a la base de datos (Ruta corregida)
const db = require('../src/config/db');

// GET /api/notifications -> Obtiene la lista de notificaciones desde la BD
const getNotifications = async (req, res) => {
  try {
    // Consulta SQL real para traer las notificaciones ordenadas por las más recientes
    const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
    
    // Convertimos los nombres de las columnas (snake_case a camelCase) para que React los entienda
    const formattedData = result.rows.map(row => ({
      id: row.id,
      message: row.message,
      isRead: row.is_read,
      createdAt: row.created_at
    }));

    res.status(200).json({
      status: 'success',
      data: formattedData
    });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/notifications/:id/read -> Marca una notificación como leída en la BD
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Consulta SQL para actualizar el estado
    const result = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.status(200).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando notificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/notifications/register-device -> (Se mantiene igual por ahora)
const registerDevice = async (req, res) => {
  try {
    const { token, platform } = req.body;
    res.status(201).json({
      status: 'success',
      message: 'Dispositivo registrado (Pendiente implementar tabla devices)',
      data: { token, platform }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  registerDevice
};