console.log("📦 OrderRoute.js loaded");

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

router.get('/', OrderController.findAll);


// router.get('/:id', orderController.getOrderById);
// router.post('/', orderController.createOrder);

module.exports = router;
