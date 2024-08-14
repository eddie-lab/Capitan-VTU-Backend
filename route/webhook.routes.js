const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhook.controller');

// monnify transactions
router.post('/monnify-transaction', WebhookController.handleMonnifyTransactions);

// vtpass transactions
router.post('/vt-pass-transaction', WebhookController.handleVtPassTransactions);


module.exports = router
