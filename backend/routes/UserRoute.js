const express = require('express');
const userController = require('../controllers/UserController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.findAll);

router.post('/chat-history', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), userController.saveChatHistory);
router.get('/chat-history', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), userController.getChatHistory);

router.get('/:userId/account', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), userController.getUserInfo);

router.put('/:userId/account', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.updateUserInfo);
router.delete('/:userId', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.deleteUser);
module.exports = router;