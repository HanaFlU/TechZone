const express = require('express');
const RoleController = require('../controllers/RoleController');
const router = express.Router();

router.post('/', RoleController.createRole);
router.put('/:id', RoleController.updateRole);
router.get('/', RoleController.getAllRoles);
router.get('/staff', RoleController.getAllStaffRoles);

module.exports = router;