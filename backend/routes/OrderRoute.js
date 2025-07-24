const express = require('express');
const OrderController = require('../controllers/OrderController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), OrderController.findAll);
//router.get('/', OrderController.findAll);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);
// Lấy tất cả đơn hàng của một customer (theo customerId)
router.get('/customer/:customerId', OrderController.getOrdersByCustomer);
router.put('/:orderId/status', checkPermission(["AD", "MANAGER"], "MANAGE_USERS"), OrderController.updateOrderStatus);
router.get('/revenue/daily', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getDailyRevenue);
router.get('/revenue/sumary', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getRevenueSummary);

module.exports = router;




