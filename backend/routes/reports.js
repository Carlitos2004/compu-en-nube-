const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getWeeklyAnalytics,
  exportTasksCSV,
  exportTasksPDF
} = require('../controllers/reportController');

router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics/weekly', getWeeklyAnalytics);
router.get('/exports/tasks/csv', exportTasksCSV);
router.get('/exports/tasks/pdf', exportTasksPDF);

module.exports = router;