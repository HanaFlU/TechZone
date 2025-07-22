const express = require('express');
const customerController = require('../controllers/CustomerController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_CUSTOMER"), customerController.findAll);
router.get('/by-user/:userId', customerController.getCustomerByUserId);

router.get('/:userId/account', customerController.getUserInfo);
router.put('/:userId/account', customerController.updateUserInfo);
router.delete('/:customerId', customerController.deleteCustomer);

router.get('/:customerId/addresses', customerController.getAddresses);
router.get('/address/:addressId', customerController.getAddressById);
router.post('/:customerId/address', customerController.addAddress);
router.put('/address/:addressId', customerController.updateAddress);
router.delete('/:customerId/address/:addressId', customerController.deleteAddress);

module.exports = router;