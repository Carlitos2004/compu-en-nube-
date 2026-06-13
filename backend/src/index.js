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

// Rutas de autenticación (controladas por feature flag)
if (process.env.FEATURE_AUTH_ENABLED === 'true') {
  app.use('/api/auth', authRoutes);
  console.log('✓ Módulo AUTH habilitado');
} else {
  console.log('✗ Módulo AUTH deshabilitado (FEATURE_AUTH_ENABLED=false)');
}

// ==================== SERVIDOR ====================

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`✓ Endpoints de salud disponibles en http://localhost:${PORT}/api/health`);
});
