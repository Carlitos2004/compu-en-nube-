/**
 * Main Server Entry Point
 * Responsable de configurar e iniciar el servidor Express
 * SRP: Solo configura middlewares, rutas y levanta el servidor
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const healthRoutes = require('../routes/health');
const authRoutes = require('../routes/auth');
const usersRoutes = require('../routes/users')
const tasksRoutes = require('../routes/tasks')
const categoriesRoutes = require('../routes/categories')
const workspacesRoutes = require('../routes/workspaces')
const notificationsRoutes = require('../routes/notifications')
const devicesRoutes = require('../routes/devices')
const reportsRoutes = require('../routes/reports')
const integrationsRoutes = require('../routes/integrations')

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================

// Seguridad - Helmet protege contra vulnerabilidades comunes
app.use(helmet());

// CORS - Permite solicitudes desde diferentes orígenes
app.use(cors());

// Parseo de JSON
app.use(express.json());

// ==================== RUTAS ====================

// Rutas de salud y monitoreo (siempre habilitadas)
app.use('/api/health', healthRoutes);
app.get('/api/metrics', require('../controllers/healthController').getMetrics);

// Rutas de autenticación (controladas por feature flag)
if (process.env.FEATURE_AUTH_ENABLED === 'true') {
  app.use('/api/auth', authRoutes);
  console.log('✓ Módulo AUTH habilitado');
} else {
  console.log('✗ Módulo AUTH deshabilitado (FEATURE_AUTH_ENABLED=false)');
}
if (process.env.FEATURE_USERS_ENABLED === 'true') {
  app.use('/api/users', usersRoutes)
  console.log('✓ Módulo USERS habilitado')
} else {
  console.log('✗ Módulo USERS deshabilitado (FEATURE_USERS_ENABLED=false)')
}
if (process.env.FEATURE_TASKS_ENABLED === 'true') {
  app.use('/api/tasks', tasksRoutes)
  console.log('Modulo TASKS habilitado')
} else {
  console.log('Modulo TASKS deshabilitado (FEATURE_TASKS_ENABLED=false)')
}
if (process.env.FEATURE_CATEGORIES_ENABLED === 'true') {
  app.use('/api/categories', categoriesRoutes)
  console.log('Modulo CATEGORIES habilitado')
} else {
  console.log('Modulo CATEGORIES deshabilitado (FEATURE_CATEGORIES_ENABLED=false)')
}
if (process.env.FEATURE_TEAMS_ENABLED === 'true') {
  app.use('/api/workspaces', workspacesRoutes)
  console.log('Modulo TEAMS habilitado')
} else {
  console.log('Modulo TEAMS deshabilitado (FEATURE_TEAMS_ENABLED=false)')
}
if (process.env.FEATURE_NOTIFICATIONS_ENABLED === 'true') {
  app.use('/api/notifications', notificationsRoutes)
  app.use('/api/devices', devicesRoutes)
  console.log('Modulo NOTIFICATIONS habilitado')
} else {
  console.log('Modulo NOTIFICATIONS deshabilitado (FEATURE_NOTIFICATIONS_ENABLED=false)')
}
if (process.env.FEATURE_REPORTS_ENABLED === 'true') {
  app.use('/api', reportsRoutes)
  console.log('Modulo REPORTS habilitado')
} else {
  console.log('Modulo REPORTS deshabilitado (FEATURE_REPORTS_ENABLED=false)')
}
if (process.env.FEATURE_INTEGRATIONS_ENABLED === 'true') {
  app.use('/api', integrationsRoutes)
  console.log('Modulo INTEGRATIONS habilitado')
} else {
  console.log('Modulo INTEGRATIONS deshabilitado (FEATURE_INTEGRATIONS_ENABLED=false)')
}

// ==================== SERVIDOR ====================

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`✓ Endpoints de salud disponibles en http://localhost:${PORT}/api/health`);
});
