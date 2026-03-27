// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../src/controllers/authController');
const { authenticateToken } = require('../src/middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;
