const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { protect, checkPermission } = require('../midleware/AuthMiddleware');

router.post('/', protect, checkPermission(["AD", "MANAGER"], "MANAGE_CATEGORY"), CategoryController.createCategory);
router.get('/', CategoryController.getCategories);
router.get('/:identifier/products', CategoryController.getProductsByCategory);
router.get('/:identifier/specifications', CategoryController.getCategorySpecifications);
router.get('/:id/descendants', CategoryController.getDescendantCategoryIds);
router.put('/:id', protect, checkPermission(["AD", "MANAGER"], "MANAGE_CATEGORY"), CategoryController.updateCategory);
router.delete('/:id', protect, checkPermission(["AD", "MANAGER"], "MANAGE_CATEGORY"), CategoryController.deleteCategory);

module.exports = router;