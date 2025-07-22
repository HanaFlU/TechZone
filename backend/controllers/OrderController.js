const Order = require('../models/OrderModel.js');
const Cart = require('../models/CartModel.js');
const Product = require('../models/ProductModel.js');
const Customer = require('../models/CustomerModel.js');
const PaymentController = require('./PaymentController.js');

function generateRandomOrderId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const generateUniqueOrderId = async () => {
    let isUnique = false;
    let generatedId;
    while (!isUnique) {
        generatedId = generateRandomOrderId(10); // Tạo order ID
        const existingOrder = await Order.findOne({ orderId: generatedId });
        if (!existingOrder) {
            isUnique = true;
        }
    }
    return generatedId;
};

const OrderController = {
    findAll: async (req, res) => {
        Order.find()
            .then((data) => res.status(200).json(data))
            .catch((err) => res.status(500).json(err.message))
    },

    getOrderById: async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId)
                .populate({
                    path: 'items.product',
                    select: 'name images'
                })
                .populate('shippingAddress')
                .populate('shippingFee');
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
            }
            res.status(200).json({ order: order });
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng.' });
        }
    },

    createOrder: async (req, res) => {
        const { customerId, shippingAddressId, paymentMethod, transactionId, paymentStatus } = req.body;

        console.log('Nhận yêu cầu tạo đơn hàng:', { customerId, shippingAddressId, paymentMethod, transactionId, paymentStatus });

        if (!customerId || !shippingAddressId || !paymentMethod) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc để tạo đơn hàng!' });
        }

        try {
            if (paymentMethod === 'CREDIT_CARD') {
                const stripePaymentResult = await PaymentController.handleStripePaymentCallback({ transactionId, paymentStatus });
                if (stripePaymentResult) {
                    return res.status(stripePaymentResult.status).json(stripePaymentResult);
                }
            }

            const cart = await Cart.findOne({ customer: customerId }).populate('items.product');
            if (!cart || cart.items.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy giỏ hàng hoặc giỏ hàng trống!' });
            }

            let totalAmount = 0;
            const orderItems = [];

            for (const cartItem of cart.items) {
                const product = cartItem.product;
                const quantity = cartItem.quantity;

                if (!product) {
                    console.warn(`Không tìm thấy sản phẩm với ID ${cartItem.product._id} trong cartItem.`);
                    return res.status(400).json({ message: `Không tìm thấy sản phẩm trong cartItem: ${cartItem.product._id}.` });
                }

                // Kiểm tra tồn kho
                if (product.stock < quantity) {
                    return res.status(400).json({ message: `Không đủ số lượng sản phẩm ${product.name} để đặt hàng. Kho: ${product.stock}, Số lượng đặt hàng: ${quantity}` });
                }

                const priceAtOrder = product.price;
                totalAmount += priceAtOrder * quantity;

                orderItems.push({
                    product: product._id,
                    quantity: quantity,
                    priceAtOrder: priceAtOrder
                });
            }

            // Phí vận chuyển sẽ xử lý sau
            const shippingFee = 20000;
            totalAmount += shippingFee;

            const newOrderId = await generateUniqueOrderId();

            // Trạng thái ban đầu của đơn hàng và thanh toán
            let initialOrderStatus = 'PENDING';
            let paymentStatusForOrder = 'PENDING';

            if (paymentMethod === 'CREDIT_CARD') {
                if (paymentStatus === 'SUCCESSED') {
                    paymentStatusForOrder = 'SUCCESSED';
                } else if (paymentStatus === 'FAILED') {
                    initialOrderStatus = 'CANCELLED';
                    paymentStatusForOrder = 'FAILED';
                }
            } else if (paymentMethod === 'COD') {
                paymentStatusForOrder = 'PENDING';
            }
            // Tạo Order
            const newOrder = new Order({
                orderId: newOrderId,
                customer: customerId,
                items: orderItems,
                shippingAddress: shippingAddressId,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                status: initialOrderStatus,
                paymentStatus: paymentStatusForOrder,
                transactionId: transactionId,
            });
            const savedOrder = await newOrder.save();

            // Cập nhật số lượng tồn kho
            if (paymentMethod === 'COD' || (paymentMethod === 'CREDIT_CARD' && paymentStatus === 'SUCCESSED')) {
                for (const orderItem of orderItems) {
                    await Product.findByIdAndUpdate(
                        orderItem.product,
                        { $inc: { stock: -orderItem.quantity } }
                    );
                }
                await Cart.findByIdAndDelete(cart._id); // Xóa giỏ hàng
            } else if (paymentMethod === 'CREDIT_CARD' && paymentStatus === 'FAILED') {
                console.log("Thanh toán Stripe thất bại, giỏ hàng được giữ lại.");
            }

            const populatedOrder = await Order.findById(savedOrder._id);
            res.status(201).json({ message: 'Tạo đơn hàng thành công!', order: populatedOrder });

        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            if (error.cause === 409) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.', error: error.message });
        }
    },
    getOrdersByCustomer: async (req, res) => {
        try {
            const { customerId } = req.params;
            // Tìm customer theo id, populate user để lấy email/name nếu cần
            const customer = await Customer.findById(customerId).populate('user');
            if (!customer) {
                return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
            }
            // Lấy tất cả order có customer = customerId
            const orders = await Order.find({ customer: customerId })
                .populate({
                    path: 'items.product',
                    select: 'name images'
                })
                .populate('shippingAddress')
                .populate('shippingFee')
                .sort({ createdAt: -1 });
            res.status(200).json({
                customer: {
                    _id: customer._id,
                    name: customer.user?.name,
                    email: customer.user?.email,
                },
                orders
            });
        } catch (error) {
            console.error('Error fetching orders by customer:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng của khách hàng.', error: error.message });
        }
    },
};


module.exports = OrderController;
