const express = require('express');
const StaffController = require('../controllers/StaffController.js');

const router = express.Router();

router.get('/', StaffController.findAll);
router.put('/:userId', StaffController.updateStaff);
router.post('/', StaffController.createStaff);


module.exports = router;