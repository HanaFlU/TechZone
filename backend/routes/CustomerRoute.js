const express = require('express');
const customerController = require('../controllers/CustomerController.js');

const router = express.Router();

router.get('/', customerController.findAll);
router.get('/:customerId/addresses', customerController.getAddresses);
router.post('/:customerId/address', customerController.addAddress);

module.exports = router;