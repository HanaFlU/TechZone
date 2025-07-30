const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { checkPermission, protect } = require('../midleware/AuthMiddleware.js');

router.post('/apply', VoucherController.applyVoucher);
router.get('/', VoucherController.findAll);
router.get('/:id', VoucherController.findVoucherById);
router.post('/', protect, checkPermission(["AD", "MANAGER"], "MANAGE_VOUCHERS"), VoucherController.createVoucher);
router.put('/:id', protect, checkPermission(["AD", "MANAGER"], "MANAGE_VOUCHERS"), VoucherController.updateVoucher);
router.delete('/:id', protect, checkPermission(["AD", "MANAGER"], "MANAGE_VOUCHERS"), VoucherController.deleteVoucher);

module.exports = router;