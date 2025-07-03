const express = require('express');
const OrderController = require('../controllers/OrderController.js');

const router = express.Router();

router.get('/', OrderController.findAll);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);

module.exports = router;