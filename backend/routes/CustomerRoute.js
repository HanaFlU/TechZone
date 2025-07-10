const express = require('express');
const customerController = require('../controllers/CustomerController.js');

const router = express.Router();

router.get('/', customerController.findAll);
router.get('/by-user/:userId', customerController.getCustomerByUserId);

router.get('/:customerId/addresses', customerController.getAddresses);
router.get('/address/:addressId', customerController.getAddressById);
router.post('/:customerId/address', customerController.addAddress);
router.put('/address/:addressId', customerController.updateAddress);
router.delete('/:customerId/address/:addressId', customerController.deleteAddress);

router.get('/:userId/account', customerController.getAccountInfo);
router.put('/:userId/account', customerController.updateAccountInfo);
router.delete('/:customerId', customerController.deleteCustomer);

module.exports = router;

