const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const { registerDevice } = require('../controllers/notificationController')

router.post('/register', verifyToken, registerDevice)

module.exports = router
