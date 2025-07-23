const express = require('express');
const router = express.Router();
const SubcategoryController = require('../controllers/SubcategoryController');

router.post('/', SubcategoryController.createSubcategory);
router.get('/', SubcategoryController.getSubcategories);

module.exports = router; 