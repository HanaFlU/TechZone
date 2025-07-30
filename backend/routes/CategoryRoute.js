const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

router.post('/', CategoryController.createCategory);
router.get('/', CategoryController.getCategories);
router.get('/:identifier/products', CategoryController.getProductsByCategory);
router.get('/:identifier/specifications', CategoryController.getCategorySpecifications);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;