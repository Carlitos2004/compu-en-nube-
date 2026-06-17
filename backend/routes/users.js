const express    = require('express')
const router     = express.Router()
const multer     = require('multer')
const verifyToken = require('../middlewares/auth')
const {
  getMe,
  updateMe,
  updatePreferences,
  uploadAvatar,
  deleteMe
} = require('../controllers/userController')

// multer en memoria para pasar el archivo directo a S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes'), false)
    }
  }
})

// Todas las rutas requieren token válido de Cognito
router.get   ('/me',              verifyToken, getMe)
router.put   ('/me',              verifyToken, updateMe)
router.put   ('/me/preferences',  verifyToken, updatePreferences)
router.post  ('/me/avatar',       verifyToken, upload.single('avatar'), uploadAvatar)
router.delete('/me',              verifyToken, deleteMe)

module.exports = router