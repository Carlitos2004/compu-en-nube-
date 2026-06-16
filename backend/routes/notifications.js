const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  registerDevice
} = require('../controllers/notificationController');

router.get('/', getNotifications);
router.patch('/read', markAsRead);
router.post('/register-device', registerDevice); // Nota: Ajustado de /api/devices/register para mantener coherencia en el router

module.exports = router;