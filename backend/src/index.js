require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Cargar conexión a la base de datos (Ruta corregida)
require('./config/db');

// Importar rutas
const healthRoutes = require('../routes/health');
const authRoutes = require('../routes/auth');
const notificationRoutes = require('../routes/notifications');
const reportRoutes = require('../routes/reports');
const taskRoutes = require('../routes/tasks');
const usersRoutes = require('../routes/users')

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================
app.use(helmet());
app.use(cors());
app.use(express.json());

// ==================== RUTAS ====================
app.use('/api/health', healthRoutes);

if (process.env.FEATURE_AUTH_ENABLED === 'true') {
  app.use('/api/auth', authRoutes);
  console.log('✓ Módulo AUTH habilitado');
} else {
  console.log('✗ Módulo AUTH deshabilitado');
}

// Forzar tus rutas (Sin Feature Flags para evitar bloqueos locales)
app.use('/api/notifications', notificationRoutes);
console.log('✓ Módulo NOTIFICATIONS habilitado (Forzado)');
if (process.env.FEATURE_USERS_ENABLED === 'true') {
  app.use('/api/users', usersRoutes)
  console.log('✓ Módulo USERS habilitado')
} else {
  console.log('✗ Módulo USERS deshabilitado (FEATURE_USERS_ENABLED=false)')
}
// ==================== SERVIDOR ====================

app.use('/api', reportRoutes); 
console.log('✓ Módulo REPORTS habilitado (Forzado)');

// ==================== SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
});
// ==================== TASKS ====================
app.use('/api/tasks', taskRoutes);
console.log('✓ Módulo TASKS habilitado');
// ==================== DEVICES ====================
app.use('/api/devices', require('../routes/devices'));