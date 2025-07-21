const express = require('express');
const CartController = require('../controllers/CartController.js');

const router = express.Router();

router.get('/', CartController.findAll);
router.get('/:userId', CartController.getCartByUserId);
router.post('/:userId', CartController.addToCart);
router.put('/:cartId', CartController.updateCartItemQuantity);
router.delete('/:cartId/:productId', CartController.removeCartItem);
router.delete('/clear/:cartId', CartController.clearCart);

module.exports = router;