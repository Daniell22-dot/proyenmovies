const express = require('express');
const router = express.Router();
const recommendationController = require('../src/controllers/recommendationController');
const auth = require('../src/middleware/auth');

router.get('/', auth.authenticateToken, recommendationController.getRecommendations);

module.exports = router;
