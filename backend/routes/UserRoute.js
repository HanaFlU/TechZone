const express = require('express');
const userController = require('../controllers/UserController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.findAll);
router.get('/:userId', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.getUserInfo);
router.put('/:userId', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.updateUserInfo);
router.delete('/:userId', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), userController.deleteUser);


module.exports = router;