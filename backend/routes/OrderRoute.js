const express = require('express');
const OrderController = require('../controllers/OrderController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "READ_ORDER"), OrderController.findAll);
router.post('/', OrderController.createOrder);

router.get('/revenue/trend', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getRevenueTrend);
router.get('/revenue/summary', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getRevenueSummary);
router.get('/statistics', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getOrderStatistics);
router.put('/:orderId/status', checkPermission(["AD", "MANAGER"], "UPDATE_ORDER"), OrderController.updateOrderStatus);

// Lấy tất cả đơn hàng của một customer (theo customerId)
router.get('/customer/:customerId', OrderController.getOrdersByCustomer);
router.get('/:id', OrderController.getOrderById);


module.exports = router;
