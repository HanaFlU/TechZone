const Product = require('../models/ProductModel.js');
const Cart = require('../models/CartModel.js');
const Customer = require('../models/CustomerModel.js');
const CartController = {
    findAll: async (req, res) => {
        Cart.find()
            .then((data) => res.status(200).json(data))
            .catch((err) => res.status(500).json(err.message))
    },
    getCartByUserId: async (req, res) => {
        try {
            const userId = req.params.userId;
            const customer = await Customer.findOne({ user: userId });

            if (!customer) {
                return res.status(404).json({ message: 'Customer profile not found for this user.' });
            }

            const customerId = customer._id;

            const cart = await Cart.findOne({ customer: customerId }).populate({
                path: 'items.product',
                model: 'Product',
                select: 'name price images stock productId',
            });

            if (!cart) {
                return res.status(200).json({ customer: customerId, items: [], message: 'Cart is empty or not found.' });
            }
            res.status(200).json(cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },
};
module.exports = CartController;