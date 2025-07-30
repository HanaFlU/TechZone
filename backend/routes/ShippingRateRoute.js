const express = require('express');
const ShippingRateController = require('../controllers/ShippingRateController');
const { checkPermission } = require('../midleware/AuthMiddleware');

const router = express.Router();

router.get('/', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), ShippingRateController.getAll);
router.get('/get-fee', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), ShippingRateController.getFee);
module.exports = router;