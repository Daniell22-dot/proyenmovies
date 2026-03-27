const express = require('express');
const router = express.Router();
const mediaController = require('../src/controllers/mediaController');
const auth = require('../src/middleware/auth');

// Public routes
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.get('/:id/access', auth.authenticateToken, mediaController.checkAccess);

// Secured routes
router.get('/download/:id', auth.authenticateToken, mediaController.downloadMedia); 

// Admin routes
router.post('/', mediaController.createMedia);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);
router.post('/upload-media', mediaController.uploadMedia);

// Admin specific analytics/management
router.get('/admin/all', mediaController.getMediaForAdmin); 
router.post('/:id/play', mediaController.incrementPlayCount); 
router.post('/:id/purchase', mediaController.recordPurchase); 

module.exports = router;