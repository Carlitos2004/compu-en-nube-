/**
 * Health Routes
 * Responsable de mapear endpoints de salud
 * SRP: Solo define las rutas de health checks
 */

const express = require('express');
const router = express.Router();
const {
  getLiveness,
  getReadiness,
  getMetrics
} = require('../controllers/healthController');

// Endpoint de liveness probe
router.get('/liveness', getLiveness);

// Endpoint de readiness probe
router.get('/readiness', getReadiness);

// Endpoint de métricas del sistema
router.get('/metrics', getMetrics);

module.exports = router;
