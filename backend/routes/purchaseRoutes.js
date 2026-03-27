const express = require('express');
const router = express.Router();
const purchaseController = require('../src/controllers/purchaseController');

router.post('/create', purchaseController.createPurchase);
router.post('/verify', purchaseController.verifyAccess);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/webhook', purchaseController.handlePaymentWebhook);

module.exports = router;