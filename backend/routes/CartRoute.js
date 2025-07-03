const express = require('express');
const CartController = require('../controllers/CartController.js');

const router = express.Router();

router.get('/', CartController.findAll);
router.get('/:userId', CartController.getCartByUserId);

module.exports = router;