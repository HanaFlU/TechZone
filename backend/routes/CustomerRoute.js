// backend/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');

router.get('/', customerController.findAll);
router.get('/:customerId/addresses', customerController.getAddresses);
router.post('/:customerId/address', customerController.addAddress);

module.exports = router;