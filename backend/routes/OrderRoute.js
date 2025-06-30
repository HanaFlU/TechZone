const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

router.get('/', OrderController.findAll);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);

module.exports = router;
