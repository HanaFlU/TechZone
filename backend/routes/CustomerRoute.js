const express = require('express');
const customerController = require('../controllers/CustomerController.js');

const router = express.Router();

router.get('/', customerController.findAll);
router.get('/:customerId/addresses', customerController.getAddresses);
router.post('/:customerId/address', customerController.addAddress);
router.get('/:userId/account', customerController.getAccountInfo);
router.put('/:userId/account', customerController.updateAccountInfo);

module.exports = router;

