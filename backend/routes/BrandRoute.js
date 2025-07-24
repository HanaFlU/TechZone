const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/BrandController');

router.post('/', BrandController.createBrand);
router.get('/', BrandController.getBrands);

module.exports = router; 