const router = require('express').Router();
const { authenticate }  = require('../../middleware/auth.middleware');
const {
  register, registerValidation,
  login,    loginValidation,
  getMe
} = require('./auth.controller');

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, getMe);

module.exports = router;