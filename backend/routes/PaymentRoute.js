const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

router.post('/stripe/create-intent', PaymentController.createStripePaymentIntent);

module.exports = router;