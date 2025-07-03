import express from 'express';
import OrderController from '../controllers/OrderController.js';

const router = express.Router();

router.get('/', OrderController.findAll);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);

export default router;
