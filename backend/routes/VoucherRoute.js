const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

router.post('/apply', VoucherController.applyVoucher);
router.get('/', VoucherController.findAll);
router.get('/:id', VoucherController.findVoucherById);
router.post('/', checkPermission(["AD", "MANAGER"], "MANAGE_VOUCHERS"), VoucherController.createVoucher);
router.put('/:id', checkPermission(["AD", "MANAGER"], "MANAGE_VOUCHERS"), VoucherController.updateVoucher);
router.delete('/:id', checkPermission(["AD", "MANAGER"], "MANAGE_VOUCHERS"), VoucherController.deleteVoucher);

module.exports = router;