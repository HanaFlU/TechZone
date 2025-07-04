const express = require('express');
const OrderController = require('../controllers/OrderController.js');

const router = express.Router();

router.get('/', OrderController.findAll);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);
// Lấy tất cả đơn hàng của một customer (theo customerId)
router.get('/customer/:customerId', OrderController.getOrdersByCustomer);

module.exports = router;