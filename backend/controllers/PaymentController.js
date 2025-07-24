const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/CartModel.js');
const Product = require('../models/ProductModel.js');
const Order = require('../models/OrderModel.js');
const PaymentController = {
    createStripePaymentIntent: async (req, res) => {
        const { customerId, shippingAddressId, shippingFee } = req.body;
        if (!customerId || !shippingAddressId || shippingFee == undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin khách hàng hoặc địa chỉ giao hàng.' });
        }

        try {
            const cart = await Cart.findOne({ customer: customerId }).populate('items.product');
            if (!cart || cart.items.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy giỏ hàng hoặc giỏ hàng trống!' });
            }

            let totalAmount = 0;
            const orderItemsForPayment = [];

            for (const cartItem of cart.items) {
                const product = cartItem.product;
                const quantity = cartItem.quantity;

                if (!product) {
                    console.warn(`Không tìm thấy sản phẩm với ID ${cartItem.product._id} trong cartItem.`);
                    return res.status(400).json({ message: `Không tìm thấy sản phẩm trong giỏ hàng: ${cartItem.product._id}.` });
                }

                // Kiểm tra tồn kho trước khi tạo PaymentIntent
                if (product.stock < quantity) {
                    return res.status(400).json({ message: `Không đủ số lượng sản phẩm ${product.name} trong kho. Kho: ${product.stock}, Số lượng đặt: ${quantity}` });
                }

                totalAmount += product.price * quantity;
                orderItemsForPayment.push({
                    productId: product._id.toString(),
                    quantity: quantity,
                    priceAtOrder: product.price
                });
            }

            totalAmount += shippingFee;
            const amountInMinorUnits = Math.round(totalAmount / 1000);

            console.log('Final amount to send to Stripe:', amountInMinorUnits);
            console.log('Currency for PaymentIntent:', 'vnd');

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInMinorUnits,
                currency: 'vnd',
                payment_method_types: ['card'],
            });

            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                message: 'PaymentIntent đã được tạo thành công!',
                totalAmount: totalAmount,
                orderItems: orderItemsForPayment,
            });

        } catch (error) {
            console.error('Lỗi khi tạo PaymentIntent:', error);
            res.status(500).json({ message: 'Lỗi server khi tạo PaymentIntent.', error: error.message });
        }
    },
    handleStripePaymentCallback: async ({ transactionId, paymentStatus }) => {
        if (!transactionId || !paymentStatus) {
            throw new Error('Thiếu transactionId hoặc paymentStatus cho thanh toán thẻ tín dụng.');
        }
        if (!['SUCCESSED', 'FAILED'].includes(paymentStatus)) {
            throw new Error('Trạng thái thanh toán không hợp lệ.');
        }

        const existingOrder = await Order.findOne({ transactionId: transactionId });
        if (existingOrder) {
            if (existingOrder.paymentStatus !== paymentStatus) {
                existingOrder.paymentStatus = paymentStatus;
                if (paymentStatus === 'SUCCESSED') {
                    existingOrder.status = 'PENDING';
                } else if (paymentStatus === 'FAILED') {
                    existingOrder.status = 'CANCELLED';
                }
                await existingOrder.save();
                return { status: 200, message: 'Đơn hàng đã tồn tại và trạng thái thanh toán được cập nhật.', order: existingOrder };
            }
            throw new Error('Đơn hàng đã tồn tại với giao dịch này.', { cause: 409 });
        }
        return null;
    }
};

module.exports = PaymentController;