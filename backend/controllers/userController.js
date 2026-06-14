const pool = require('../src/config/db')
const AWS = require('aws-sdk')

const s3 = new AWS.S3({ region: process.env.AWS_REGION })

// ─────────────────────────────────────────────
// GET /api/users/me
// Retorna datos del perfil del usuario logueado
// Lee de PostgreSQL
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, biografia, avatar_url, created_at FROM usuarios WHERE cognito_sub = $1',
      [req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.status(200).json({ usuario: rows[0] })

  } catch (error) {
    console.error('Error en getMe:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ─────────────────────────────────────────────
// PUT /api/users/me
// Actualiza nombre o biografía del usuario
// Actualiza PostgreSQL
// ─────────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    const { nombre, biografia } = req.body

    if (!nombre && !biografia) {
      return res.status(400).json({ error: 'Debes enviar al menos nombre o biografia' })
    }

    const { rows } = await pool.query(
      `UPDATE usuarios 
       SET nombre    = COALESCE($1, nombre),
           biografia = COALESCE($2, biografia),
           updated_at = NOW()
       WHERE cognito_sub = $3
       RETURNING id, nombre, biografia, updated_at`,
      [nombre || null, biografia || null, req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.status(200).json({ usuario: rows[0] })

  } catch (error) {
    console.error('Error en updateMe:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ─────────────────────────────────────────────
// PUT /api/users/me/preferences
// Guarda preferencias de UI (darkMode, zona horaria)
// Actualiza PostgreSQL en columna JSONB
// ─────────────────────────────────────────────
const updatePreferences = async (req, res) => {
  try {
    const { darkMode, zonaHoraria } = req.body

    if (darkMode === undefined && !zonaHoraria) {
      return res.status(400).json({ error: 'Debes enviar al menos una preferencia' })
    }

    const { rows } = await pool.query(
      `UPDATE usuarios
       SET preferencias = preferencias || $1::jsonb,
           updated_at   = NOW()
       WHERE cognito_sub = $2
       RETURNING id, preferencias`,
      [JSON.stringify({ darkMode, zonaHoraria }), req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.status(200).json({ preferencias: rows[0].preferencias })

  } catch (error) {
    console.error('Error en updatePreferences:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ─────────────────────────────────────────────
// POST /api/users/me/avatar
// Sube imagen de perfil a S3
// Devuelve la URL pública
// ─────────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' })
    }

    const extension = req.file.mimetype.split('/')[1]
    const key = `avatars/${req.userId}.${extension}`

    const params = {
      Bucket:      process.env.S3_BUCKET_NAME,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
    }

    await s3.upload(params).promise()

    const avatarUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    await pool.query(
      'UPDATE usuarios SET avatar_url = $1, updated_at = NOW() WHERE cognito_sub = $2',
      [avatarUrl, req.userId]
    )

    return res.status(200).json({ avatar_url: avatarUrl })

  } catch (error) {
    console.error('Error en uploadAvatar:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ─────────────────────────────────────────────
// DELETE /api/users/me
// Elimina cuenta permanentemente (Hard Delete)
// Borra en Cognito y cascada en PostgreSQL
// ─────────────────────────────────────────────
const deleteMe = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Eliminar en PostgreSQL (cascada elimina tareas y datos relacionados)
    await client.query(
      'DELETE FROM usuarios WHERE cognito_sub = $1',
      [req.userId]
    )

    // 2. Eliminar en Cognito
    const cognito = new AWS.CognitoIdentityServiceProvider({
      region: process.env.AWS_REGION
    })

    await cognito.adminDeleteUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username:   req.userId
    }).promise()

    await client.query('COMMIT')

    return res.status(200).json({ mensaje: 'Cuenta eliminada permanentemente' })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en deleteMe:', error)
    return res.status(500).json({ error: 'Error al eliminar la cuenta' })
  } finally {
    client.release()
  }
}

module.exports = { getMe, updateMe, updatePreferences, uploadAvatar, deleteMe }