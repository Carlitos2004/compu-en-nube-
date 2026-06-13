/**
 * Health Controller
 * Responsable de monitoreo y salud del servidor
 * SRP: Solo maneja la lógica de health checks
 */

/**
 * Verifica si el servidor está activo (liveness probe)
 * GET /api/health/liveness
 */
const getLiveness = (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
};

/**
 * Verifica si los servicios dependientes están listos (readiness probe)
 * GET /api/health/readiness
 */
const getReadiness = (req, res) => {
  // Simulamos estado de conexiones
  const isDbConnected = true;
  const isCacheConnected = true;

  if (isDbConnected && isCacheConnected) {
    return res.status(200).json({
      isDbConnected,
      isCacheConnected,
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({
    isDbConnected,
    isCacheConnected,
    status: 'NOT_READY',
    timestamp: new Date().toISOString()
  });
};

/**
 * Retorna métricas del sistema
 * GET /api/health/metrics
 */
const getMetrics = (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const cpuUsage = process.cpuUsage();

  res.status(200).json({
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    uptime: `${Math.round(uptime)} segundos`,
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getLiveness,
  getReadiness,
  getMetrics
};
