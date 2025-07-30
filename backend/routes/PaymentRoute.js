const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { checkPermission } = require('../midleware/AuthMiddleware');

router.post('/stripe/create-intent', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), PaymentController.createStripePaymentIntent);

module.exports = router;