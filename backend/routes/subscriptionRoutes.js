// backend/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subController = require('../src/controllers/subscriptionController');
const { authenticateToken } = require('../src/middleware/auth');

router.get('/plans', subController.getPlans);
router.post('/subscribe', authenticateToken, subController.subscribe);
router.get('/check', authenticateToken, subController.checkSubscription);

module.exports = router;
