import express from 'express';
import CartController from '../controllers/CartController.js'; // Correct import for default export

const router = express.Router();

router.get('/', CartController.findAll);
router.get('/:userId', CartController.getCartByUserId); // Example route for getCartByUserId

export default router;