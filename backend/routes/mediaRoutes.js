const auth = require('../src/middleware/auth');

// Public routes
router.get('/', mediaController.getAllMedia);
router.get('/preview/:id', mediaController.getPreview);
router.get('/:id', mediaController.getMediaById);
router.get('/:id/access', auth.authenticateToken, mediaController.checkAccess);

// Secured routes
router.get('/download/:id', auth.authenticateToken, mediaController.downloadMedia); 

// Admin routes (add authentication middleware later)
router.post('/', mediaController.createMedia);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);
router.post('/upload', mediaController.uploadFile);
router.post('/upload-media', mediaController.uploadMedia);

// NEW: Admin specific routes
router.get('/admin/all', mediaController.getMediaForAdmin); // Get all media including drafts
router.post('/:id/play', mediaController.incrementPlayCount); // Record a play
router.post('/:id/purchase', mediaController.recordPurchase); // Record a purchase
router.get('/file/:id', mediaController.getMediaFile); // Get file info

module.exports = router;