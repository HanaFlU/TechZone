const Order = require('../models/OrderModel');
// const Cart = require('../models/CartModel');
// const Product = require('../models/ProductModel');
// const Customer = require('../models/CustomerModel');
const OrderController = {
    findAll: async (req, res) => {
        Order.find()
            .then((data) => res.status(200).json(data))
            .catch((err) => res.status(500).json(err.message))
    },
};
module.exports = OrderController;


// exports.getOrderById = async (req, res) => {
//     try {
//         const orderId = req.params.id;

//         const order = await Order.findById(orderId)
//             .populate('customer', 'user')  // Nếu cần xem user gốc
//             .populate('shippingAddress')
//             .populate('items.product');

//         if (!order) {
//             return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
//         }

//         res.status(200).json(order);
//     } catch (error) {
//         console.error('Error fetching order:', error);
//         res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng.' });
//     }
// };
