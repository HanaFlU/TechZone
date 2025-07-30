const express = require('express');
const customerController = require('../controllers/CustomerController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), customerController.findAll);
router.post('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), customerController.createCustomer);
router.get('/by-user/:userId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.getCustomerByUserId);
router.get('/notifications', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.getCustomerNotifications);
router.put('/notifications/:notificationId/read', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.markNotificationAsRead);
router.put('/notifications/mark-all-read', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.markAllNotificationsAsRead);

router.get('/:userId/account', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.getCustomerInfo);
router.put('/:userId/account', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.updateCustomerInfo);
router.delete('/:customerId', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), customerController.deleteCustomer);

router.get('/:customerId/addresses', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.getAddresses);
router.get('/address/:addressId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.getAddressById);
router.post('/:customerId/address', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.addAddress);
router.put('/address/:addressId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.updateAddress);
router.delete('/:customerId/address/:addressId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), customerController.deleteAddress);

module.exports = router;