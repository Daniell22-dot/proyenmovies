// backend/src/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken); // Protect all rec routes

router.post('/history', recController.trackHistory);
router.post('/watchlist', recController.addToWatchlist);
router.delete('/watchlist/:mediaId', recController.removeFromWatchlist);
router.get('/watchlist', recController.getWatchlist);
router.get('/personalized', recController.getRecommendations);

module.exports = router;
