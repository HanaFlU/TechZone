const express = require('express');
const CartController = require('../controllers/CartController.js');
const { checkPermission } = require('../midleware/AuthMiddleware.js');

const router = express.Router();

router.get('/', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), CartController.findAll);
router.get('/:userId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), CartController.getCartByUserId);
router.post('/:userId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), CartController.addToCart);
router.post('/:userId/transfer-guest-cart', CartController.transferGuestCartToUser);
router.put('/:cartId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), CartController.updateCartItemQuantity);
router.delete('/:cartId/:productId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), CartController.removeCartItem);
router.delete('/clear/:cartId', checkPermission(["AD", "CUS", "MANAGER", "STAFF"]), CartController.clearCart);

module.exports = router;