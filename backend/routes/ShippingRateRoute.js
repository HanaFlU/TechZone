const express = require('express');
const ShippingRateController = require('../controllers/ShippingRateController');

const router = express.Router();

router.get('/', ShippingRateController.getAll);
router.get('/get-fee', ShippingRateController.getFee);
module.exports = router;