const express = require('express');
const OrderController = require('../controllers/OrderController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "MANAGER"], "READ_ORDER"), OrderController.findAll);
router.post('/', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), OrderController.createOrder);

router.get('/revenue/trend', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getRevenueTrend);
router.get('/revenue/summary', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getRevenueSummary);
router.get('/statistics', checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER"), OrderController.getOrderStatistics);
router.put('/:orderId/status', checkPermission(["AD", "MANAGER"], "UPDATE_ORDER"), OrderController.updateOrderStatus);

router.get('/customer/:customerId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), OrderController.getOrdersByCustomer);
router.get('/:id', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), OrderController.getOrderById);


module.exports = router;
