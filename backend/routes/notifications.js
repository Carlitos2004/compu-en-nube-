const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const {
  listNotifications,
  markNotificationsRead
} = require('../controllers/notificationController')

router.get('/', verifyToken, listNotifications)
router.patch('/read', verifyToken, markNotificationsRead)

module.exports = router
