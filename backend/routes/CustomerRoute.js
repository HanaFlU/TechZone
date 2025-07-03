import express from 'express';
import customerController from '../controllers/CustomerController.js';

const router = express.Router();

router.get('/', customerController.findAll);
router.get('/:customerId/addresses', customerController.getAddresses);
router.post('/:customerId/address', customerController.addAddress);

export default router;