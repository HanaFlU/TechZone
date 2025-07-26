const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/CartModel.js');
const Product = require('../models/ProductModel.js');
const Order = require('../models/OrderModel.js');
const PaymentController = {
    createStripePaymentIntent: async (req, res) => {
        const { customerId, shippingAddressId, amount, shippingFee, discountAmount } = req.body;
        if (!customerId || !shippingAddressId || amount === undefined || amount <= 0) {
            return res.status(400).json({ message: 'Thiếu hoặc sai thông tin thanh toán (customerId, shippingAddressId, totalAmount).' });
        }

        try {
            const safeTotalAmount = parseFloat(amount);
            if (isNaN(safeTotalAmount) || safeTotalAmount <= 0) {
                return res.status(400).json({ message: 'Số tiền thanh toán không hợp lệ.' });
            }
            const amountInMinorUnits = Math.round(safeTotalAmount);

            console.log('Final amount to send to Stripe (rounded):', amountInMinorUnits);
            console.log('Currency for PaymentIntent:', 'vnd');

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInMinorUnits,
                currency: 'vnd',
                payment_method_types: ['card'],
                description: `Payment for customer ${customerId}`,
                metadata: {
                    customerId: customerId,
                    shippingAddressId: shippingAddressId,
                    shippingFee: shippingFee,
                    discountAmount: discountAmount
                }
            });

            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                message: 'PaymentIntent đã được tạo thành công!',
                amount: amount,
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