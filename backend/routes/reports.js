const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const {
  getDashboardStats,
  getWeeklyAnalytics,
  exportTasksCsv,
  exportTasksPdf
} = require('../controllers/reportController')

router.get('/dashboard/stats', verifyToken, getDashboardStats)
router.get('/analytics/weekly', verifyToken, getWeeklyAnalytics)
router.get('/exports/tasks/csv', verifyToken, exportTasksCsv)
router.get('/exports/tasks/pdf', verifyToken, exportTasksPdf)

module.exports = router
