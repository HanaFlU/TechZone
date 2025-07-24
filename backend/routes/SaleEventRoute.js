const express = require('express');
const router = express.Router();
const SaleEventController = require('../controllers/SaleEventController');

router.post('/', SaleEventController.createSaleEvent);
router.get('/', SaleEventController.getSaleEvents);

module.exports = router; 