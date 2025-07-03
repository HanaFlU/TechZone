const express = require('express');
const customerController = require('../controllers/CustomerController.js');

const router = express.Router();

router.get('/', customerController.findAll);
router.get('/:customerId/addresses', customerController.getAddresses);
router.post('/:customerId/address', customerController.addAddress);
router.get('/:customerId/account', customerController.getAccountInfo);
router.put('/:customerId/account', customerController.updateAccountInfo);

module.exports = router;

