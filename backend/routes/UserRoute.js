const express = require('express');
const userController = require('../controllers/UserController.js');
const { checkPermission, protect } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.findAll);
router.get('/:userId/account', userController.getUserInfo);
router.put('/:userId/account', userController.updateUserInfo);
router.delete('/:userId', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.deleteUser);

router.post('/chat-history', protect, userController.saveChatHistory);
router.get('/chat-history', protect, userController.getChatHistory);
module.exports = router;