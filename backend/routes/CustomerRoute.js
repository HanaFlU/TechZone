const express = require('express');
const customerController = require('../controllers/CustomerController.js');
const { checkPermission, protect } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), customerController.findAll);
router.post('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), customerController.createCustomer);
router.get('/by-user/:userId', customerController.getCustomerByUserId);
router.get('/notifications', customerController.getCustomerNotifications);
router.put('/notifications/:notificationId/read', customerController.markNotificationAsRead);
router.put('/notifications/mark-all-read', customerController.markAllNotificationsAsRead);
router.post('/chat-history', protect, customerController.saveChatHistory);
router.get('/chat-history', protect, customerController.getChatHistory);

router.get('/:userId/account', customerController.getUserInfo);
router.put('/:userId/account', customerController.updateUserInfo);
router.delete('/:customerId', customerController.deleteCustomer);

router.get('/:customerId/addresses', customerController.getAddresses);
router.get('/address/:addressId', customerController.getAddressById);
router.post('/:customerId/address', customerController.addAddress);
router.put('/address/:addressId', customerController.updateAddress);
router.delete('/:customerId/address/:addressId', customerController.deleteAddress);

module.exports = router;