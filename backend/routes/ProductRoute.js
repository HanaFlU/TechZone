const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { checkPermission, protect } = require('../midleware/AuthMiddleware');


router.get('/admin', protect, checkPermission(["AD", "MANAGER", "STAFF"], "READ_PRODUCT"), ProductController.adminGetAllProducts);
router.post('/', protect, checkPermission(["AD", "MANAGER", "STAFF"], "CREATE_PRODUCT"), ProductController.createProduct);

router.get('/reports/top-selling', protect, checkPermission(["AD", "MANAGER", "STAFF"], "READ_ORDER", "READ_PRODUCT"), ProductController.getTopSellingProducts);

router.post('/bulk-update', protect, checkPermission(["AD", "MANAGER", "STAFF"], "UPDATE_PRODUCT"), ProductController.bulkUpdateProducts);
router.delete('/bulk-delete', protect, checkPermission(["AD", "MANAGER", "STAFF"], "DELETE_PRODUCT"), ProductController.bulkDeleteProducts);
router.post('/generate-missing-specs-keys', protect, checkPermission(["AD", "MANAGER", "STAFF"], "UPDATE_PRODUCT"), ProductController.generateMissingSpecKeys);

router.get('/admin/:id', protect, checkPermission(["AD", "MANAGER", "STAFF"], "READ_PRODUCT"), ProductController.adminGetProductById);
router.put('/:id', protect, checkPermission(["AD", "MANAGER", "STAFF"], "UPDATE_PRODUCT"), ProductController.updateProduct);
router.delete('/:id', protect, checkPermission(["AD", "MANAGER", "STAFF"], "DELETE_PRODUCT"), ProductController.deleteProduct);


router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

module.exports = router;
