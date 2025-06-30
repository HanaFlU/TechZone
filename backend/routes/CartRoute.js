const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

router.get('/', CartController.findAll);
router.get('/:userId', CartController.getCartByUserId);

module.exports = router;