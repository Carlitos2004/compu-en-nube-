const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const { syncCalendar, createWebhook } = require('../controllers/integrationController')

router.get('/calendar/sync', verifyToken, syncCalendar)
router.post('/webhooks', verifyToken, createWebhook)

module.exports = router
