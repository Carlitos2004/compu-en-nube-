/**
 * Auth Routes
 * Responsable de mapear endpoints de autenticación
 * SRP: Solo define las rutas de autenticación
 */

const express = require('express');
const router = express.Router();
const {
  register,
  confirm,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  logout,
  setupMFA
} = require('../controllers/authController');

// Endpoint de registro
router.post('/register', register);

// Endpoint de confirmación
router.post('/confirm', confirm);

// Endpoint de login
router.post('/login', login);

// Endpoint de refresh de token
router.post('/refresh', refresh);

// Endpoint de forgot password
router.post('/forgot-password', forgotPassword);

// Endpoint de reset password
router.post('/reset-password', resetPassword);

// Endpoint de logout
router.post('/logout', logout);

// Endpoint de setup MFA
router.post('/mfa/setup', setupMFA);

module.exports = router;
