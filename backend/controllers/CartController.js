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
                return res.status(404).json({ message: 'Không tìm thấy customer qua userId.' });
            }
            const customerId = customer._id;
            const cart = await Cart.findOne({ customer: customerId }).populate({
                path: 'items.product',
                model: 'Product',
                select: 'name price images stock productId',
            });

            if (!cart) {
                return res.status(200).json({ customer: customerId, items: [] });
            }
            res.status(200).json(cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },

    addToCart: async (req, res) => {
        try {
            const userId = req.params.userId;
            const { productId, quantity } = req.body;
            const customer = await Customer.findOne({ user: userId });
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy customer.' });
            }
            const customerId = customer._id;
            if (!productId || !quantity) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin: productId, hoặc quantity.' });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
            }
            if (product.stock < quantity) {
                return res.status(400).json({ success: false, message: 'Số lượng sản phẩm trong kho không đủ.' });
            }

            let cart = await Cart.findOne({ customer: customerId });
            if (!cart) {
                cart = new Cart({ customer: customerId, items: [] });
            }

            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                const newQuantity = cart.items[itemIndex].quantity + quantity;
                if (product.stock < newQuantity) {
                    return res.status(400).json({ success: false, message: 'Số lượng thêm vào vượt quá số lượng trong kho.' });
                }
                cart.items[itemIndex].quantity = newQuantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            await cart.save();
            await cart.populate({
                path: 'items.product',
                model: 'Product',
                select: 'name price images stock productId',
            });
            res.status(200).json({ success: true, message: 'Sản phẩm đã được thêm vào giỏ hàng!', cart });
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ success: false, message: 'Server Error', error: error.message });
        }
    },

    updateCartItemQuantity: async (req, res) => {
        try {
            const cartId = req.params.cartId;
            const { productId, quantity } = req.body;
            if (!productId || typeof quantity !== 'number' || quantity < 1) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin: productId, hoặc số lượng không hợp lệ.' });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
            }
            if (product.stock < quantity) {
                return res.status(400).json({ success: false, message: 'Số lượng cập nhật vượt quá số lượng trong kho.' });
            }

            const cart = await Cart.findById(cartId);
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
            }

            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;
                await cart.save();
                await cart.populate({
                    path: 'items.product',
                    model: 'Product',
                    select: 'name price images stock productId',
                });
                res.status(200).json({ success: true, message: 'Cập nhật số lượng sản phẩm thành công!', cart });
            } else {
                res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy trong giỏ hàng.' });
            }
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            res.status(500).json({ success: false, message: 'Server Error', error: error.message });
        }
    },

    removeCartItem: async (req, res) => {
        try {
            const { cartId, productId } = req.params;
            const cart = await Cart.findById(cartId);
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
            }
            const initialLength = cart.items.length;
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            if (cart.items.length === initialLength) {
                return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy trong giỏ hàng để xóa.' });
            }
            await cart.save();
            await cart.populate({
                path: 'items.product',
                model: 'Product',
                select: 'name price images stock productId',
            });
            res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa khỏi giỏ hàng!', cart });
        } catch (error) {
            console.error('Error removing cart item:', error);
            res.status(500).json({ success: false, message: 'Server Error', error: error.message });
        }
    },

    clearCart: async (req, res) => {
        try {
            const { cartId } = req.params;
            const cart = await Cart.findById(cartId);
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
            }

            cart.items = [];
            await cart.save();
            res.status(200).json({ success: true, message: 'Giỏ hàng đã được làm trống!', cart });
        } catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ success: false, message: 'Server Error', error: error.message });
        }
    }
};

module.exports = CartController;