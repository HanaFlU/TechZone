const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { checkPermission, protect } = require('../midleware/AuthMiddleware');

router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/reports/top-selling', protect, checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER", "READ_PRODUCT"), ProductController.getTopSellingProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
