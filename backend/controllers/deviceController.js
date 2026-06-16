const db = require('../src/config/db');

const registerDevice = async (req, res) => {
  try {
    const { token, type } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token de dispositivo requerido' });
    }

    // Usamos ON CONFLICT para actualizar si el token ya existe
    await db.query(`
      INSERT INTO user_devices (device_token, device_type)
      VALUES ($1, $2)
      ON CONFLICT (device_token) 
      DO UPDATE SET created_at = CURRENT_TIMESTAMP
    `, [token, type || 'browser']);

    res.status(200).json({ status: 'success', message: 'Dispositivo registrado' });
  } catch (error) {
    console.error('Error registrando dispositivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { registerDevice };