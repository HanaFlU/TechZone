const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

router.post('/', CategoryController.createCategory);
router.get('/', CategoryController.getCategories);

module.exports = router;