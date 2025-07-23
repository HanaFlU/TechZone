const express = require('express');
const StaffController = require('../controllers/StaffController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD"], "MANAGE_USERS"), StaffController.findAll);
router.put('/:userId', checkPermission(["AD"], "MANAGE_USERS"), StaffController.updateStaff);
router.post('/', checkPermission(["AD"], "MANAGE_USERS"), StaffController.createStaff);


module.exports = router;