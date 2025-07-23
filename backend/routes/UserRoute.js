const express = require('express');
const userController = require('../controllers/UserController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.findAll);
router.get('/:userId/account', userController.getUserInfo);
router.put('/:userId/account', userController.updateUserInfo);
router.delete('/:userId', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.deleteUser);


module.exports = router;