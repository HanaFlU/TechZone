const Order = require('../models/OrderModel.js');
const Cart = require('../models/CartModel.js');
const Product = require('../models/ProductModel.js');
const Customer = require('../models/CustomerModel.js')
const User = require('../models/UserModel.js');
const ShippingRate = require('../models/ShippingRateModel.js');
const Voucher = require('../models/VoucherModel');
const PaymentController = require('./PaymentController.js');
const CartController = require('./CartController.js');
const VoucherController = require('./VoucherController.js');
const OrderConfirmationEmail = require('./OrderConfirmationEmail.js');
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
const getStatusDisplayName = (status) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPED': return 'Đang giao hàng';
        case 'DELIVERED': return 'Đã giao hàng';
        case 'CANCELLED': return 'Đã hủy';
        default: return 'Không xác định';
    }
};

const OrderController = {
    createOrder: async (req, res) => {
        const {
            customerId,
            shippingAddressId,
            paymentMethod,
            transactionId,
            paymentStatus,
            orderItems,
            totalAmount,
            shippingFee,
            discountAmount,
            voucherCode
        } = req.body;

        console.log('Nhận yêu cầu tạo đơn hàng:', { customerId, shippingAddressId, paymentMethod, transactionId, paymentStatus, totalAmount, shippingFee, orderItems, discountAmount, voucherCode });
        if (!customerId || !shippingAddressId || !paymentMethod || !orderItems || orderItems.length === 0 || totalAmount === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc để tạo đơn hàng hoặc giỏ hàng trống!' });
        }

        try {
            const finalOrderItems = [];
            let calculatedTotalAmountFromBackend = 0;
            const productIdsInOrder = [];

            for (const item of orderItems) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID ${item.productId}.` });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Không đủ số lượng sản phẩm ${product.name} để đặt hàng. Kho: ${product.stock}, Số lượng đặt hàng: ${item.quantity}` });
                }

                const priceAtOrder = product.price;
                calculatedTotalAmountFromBackend += priceAtOrder * item.quantity;

                finalOrderItems.push({
                    product: item.productId,
                    quantity: item.quantity,
                    priceAtOrder: priceAtOrder
                });
                productIdsInOrder.push(item.productId);
            }

            // Thêm phí vận chuyển vào tổng số tiền backend tự tính toán
            calculatedTotalAmountFromBackend = calculatedTotalAmountFromBackend + shippingFee - discountAmount;
            if (Math.abs(calculatedTotalAmountFromBackend - totalAmount) > 1) {
                console.warn(`Mismatch totalAmount: Frontend ${totalAmount}, Backend ${calculatedTotalAmountFromBackend}`);
            }

            const newOrderId = await generateUniqueOrderId();

            // Trạng thái ban đầu của đơn hàng và thanh toán
            let initialOrderStatus = 'PENDING';
            let paymentStatusForOrder = 'PENDING';
            // Tạo lịch sử trạng thái đơn hàng
            const initialStatusHistory = [{
                status: 'PENDING',
                timestamp: new Date()
            }];

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
                items: finalOrderItems,
                shippingAddress: shippingAddressId,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                shippingFee: shippingFee,
                status: initialOrderStatus,
                paymentStatus: paymentStatusForOrder,
                transactionId: transactionId,
                statusHistory: initialStatusHistory,
                discountAmount: discountAmount,
                voucherCode: voucherCode
            });
            const savedOrder = await newOrder.save();
            if (paymentStatusForOrder === 'SUCCESSED' || paymentMethod === 'COD') {
                // Giảm stock sản phẩm
                for (const orderItem of finalOrderItems) {
                    await Product.findByIdAndUpdate(
                        orderItem.product,
                        { $inc: { stock: -orderItem.quantity } }
                    );
                }

                // Xóa sản phẩm đã đặt khỏi giỏ hàng
                const customerCart = await Cart.findOne({ customer: customerId });
                if (customerCart) {
                    customerCart.items = customerCart.items.filter(item =>
                        !productIdsInOrder.includes(item.product.toString())
                    );
                    await customerCart.save();
                }

                // Cập nhật usedCount cho Voucher nếu có voucherCode
                if (voucherCode) {
                    try {
                        // Tìm voucher bằng mã code
                        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
                        if (voucher) {
                            // Gọi hàm nội bộ từ VoucherController để đánh dấu voucher đã sử dụng
                            await VoucherController._markVoucherAsUsedInternal(voucher._id, customerId);
                        } else {
                            console.warn(`Voucher with code ${voucherCode} not found when trying to mark as used for Order ${savedOrder.orderId}.`);
                        }
                    } catch (voucherError) {
                        console.error(`Error updating voucher ${voucherCode} for Order ${savedOrder.orderId}:`, voucherError);
                        // Không trả về lỗi 500 ở đây để không chặn việc tạo đơn hàng chính
                        // Bạn có thể cân nhắc một hệ thống retry hoặc ghi log chi tiết hơn
                    }
                }

                // Populate các trường cần thiết để gửi email
                const populatedOrder = await Order.findById(savedOrder._id)
                    .populate({
                        path: 'items.product',
                        select: 'name images'
                    })
                    .populate('shippingAddress')
                    .populate({
                        path: 'customer',
                        populate: {
                            path: 'user',
                            select: 'email name'
                        }
                    });

                if (populatedOrder && populatedOrder.customer && populatedOrder.customer.user && populatedOrder.customer.user.email) {
                    await OrderConfirmationEmail(
                        populatedOrder,
                        populatedOrder.customer.user.email,
                        populatedOrder.customer.user.name,
                        populatedOrder.items.product
                    );
                } else {
                    console.warn(`Không thể gửi email xác nhận đơn hàng #${populatedOrder.orderId}: Thiếu thông tin email khách hàng.`);
                }

                return res.status(201).json({ message: 'Tạo đơn hàng thành công!', order: populatedOrder });

            } else if (paymentStatusForOrder === 'FAILED' && paymentMethod === 'CREDIT_CARD') {
                console.log("Thanh toán Stripe thất bại, giỏ hàng được giữ lại.");
                return res.status(201).json({ message: 'Đơn hàng đã được ghi nhận nhưng thanh toán thất bại.', order: savedOrder });
            } else {
                return res.status(201).json({ message: 'Đơn hàng đã được tạo với trạng thái chờ xử lý.', order: savedOrder });
            }

        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.', error: error.message });
        }
    },
    getOrdersByCustomer: async (req, res) => {
        try {
            const { customerId } = req.params;
            // Tìm customer opulate user để lấy email
            const customer = await Customer.findById(customerId).populate('user');
            if (!customer) {
                return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
            }
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

    findAll: async (req, res) => {
        try {
            const { customerNameOrEmail, status, method, startDate, endDate, limit = 10, page = 1 } = req.query;
            let query = {};

            if (status) {
                query.status = status;
            }

            if (method) {
                query.paymentMethod = method;
            }

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) {
                    query.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    query.createdAt.$lte = endOfDay;
                }
            }

            if (customerNameOrEmail) {
                const users = await User.find({
                    $or: [
                        { name: { $regex: customerNameOrEmail, $options: 'i' } },
                        { email: { $regex: customerNameOrEmail, $options: 'i' } }
                    ]
                }).select('_id');

                const customerIds = await Customer.find({ user: { $in: users.map(user => user._id) } }).select('_id');

                if (customerIds.length > 0) {
                    query.customer = { $in: customerIds.map(customer => customer._id) };
                } else {
                    return res.status(200).json({ orders: [], totalOrders: 0 });
                }
            }

            const options = {
                limit: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit),
                sort: { createdAt: -1 },
                populate: [
                    { path: 'customer', populate: { path: 'user', select: 'name email' } },
                    { path: 'shippingAddress' },
                    { path: 'items.product', select: 'name images' }
                ],
            };

            const orders = await Order.find(query)
                .limit(options.limit)
                .skip(options.skip)
                .sort(options.sort)
                .populate(options.populate);

            const totalOrders = await Order.countDocuments(query);

            res.status(200).json({ orders, totalOrders });

        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng admin:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng.', error: error.message });
        }
    },

    getOrderById: async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId)
                .populate({
                    path: 'customer',
                    populate: {
                        path: 'user',
                        select: 'name email phone'
                    }
                })
                .populate({
                    path: 'items.product',
                    select: 'name images'
                })
                .populate('shippingAddress')

            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
            }
            res.status(200).json({ order: order });
        } catch (error) {
            console.error('Lỗi khi lấy đơn hàng theo ID:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng.', error: error.message }); // Trả về lỗi chi tiết hơn
        }
    },
    addOrderNotificationToCustomer: async (customerId, orderId, oldStatus, newStatus) => {
        try {
            const customer = await Customer.findById(customerId);
            if (customer) {
                const message = `Đơn hàng #${orderId} của bạn đã được cập nhật trạng thái`;
                const link = `/account/orders/${orderId}`;
                customer.notifications.unshift({
                    message,
                    orderId: orderId,
                    oldStatus: oldStatus,
                    newStatus: newStatus,
                    isRead: false,
                    createdAt: new Date(),
                    link
                });

                customer.notifications = customer.notifications.slice(0, 50);
                await customer.save();
                console.log(`[Notification] Added order status update notification for customer ${customerId}, order ${orderId}`);
            } else {
                console.warn(`[Notification] Customer with ID ${customerId} not found.`);
            }
        } catch (error) {
            console.error(`[Notification] Error adding order status notification for customer ${customerId}:`, error);
        }
    },
    updateOrderStatus: async (req, res) => {
        const { orderId } = req.params;
        const { newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({ message: 'Trạng thái mới không được bỏ trống.' });
        }

        const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        }

        try {
            const order = await Order.findById(orderId).populate('customer');;

            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
            }
            const oldStatus = order.status;

            // Ngăn chặn cập nhật nếu trạng thái hiện tại đã là CANCELLED hoặc DELIVERED
            if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
                return res.status(400).json({ message: `Không thể cập nhật trạng thái đơn hàng đã '${order.status}'.` });
            }
            // Chỉ cập nhật và thêm vào lịch sử nếu trạng thái mới khác trạng thái hiện tại
            if (order.status !== newStatus) {
                order.status = newStatus;
                order.statusHistory.push({
                    status: newStatus,
                    timestamp: new Date()
                });
                await order.save();
                if (order.customer && order.customer._id) {
                    await OrderController.addOrderNotificationToCustomer(order.customer._id, order._id, oldStatus, newStatus);
                } else {
                    console.warn(`[Notification] Customer ID not found for order ${orderId}. Notification skipped.`);
                }
            }
            res.status(200).json({ message: 'Cập nhật trạng thái đơn hàng thành công.', order });

        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái đơn hàng.', error: error.message });
        }
    },
    getDailyRevenue: async (req, res) => {
        try {
            const revenueData = await Order.aggregate([
                {
                    $match: {
                        status: { $ne: 'CANCELLED' },
                        paymentStatus: 'SUCCESSED' // hoặc thêm COD nếu bạn tính COD là đã thanh toán
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
                        },
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        totalRevenue: 1
                    }
                }
            ]);

            res.status(200).json(revenueData);
        } catch (error) {
            console.error("Lỗi khi tính doanh thu theo ngày:", error);
            res.status(500).json({ message: "Lỗi server khi tính doanh thu.", error: error.message });
        }
    },
    getRevenueSummary: async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // ngày cuối tháng trước

            const matchCondition = {
                status: { $ne: "CANCELLED" },
                paymentStatus: "SUCCESSED",
            };

            const [todayTotal, yesterdayTotal, thisMonthTotal, lastMonthTotal, allTimeTotal] = await Promise.all([
                // Today
                Order.aggregate([
                    { $match: { ...matchCondition, orderDate: { $gte: today } } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
                // Yesterday
                Order.aggregate([
                    {
                        $match: {
                            ...matchCondition,
                            orderDate: { $gte: yesterday, $lt: today },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
                // This Month
                Order.aggregate([
                    { $match: { ...matchCondition, orderDate: { $gte: startOfThisMonth } } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
                // Last Month
                Order.aggregate([
                    {
                        $match: {
                            ...matchCondition,
                            orderDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
                // All Time
                Order.aggregate([
                    { $match: matchCondition },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
            ]);

            res.status(200).json({
                today: todayTotal[0]?.total || 0,
                yesterday: yesterdayTotal[0]?.total || 0,
                thisMonth: thisMonthTotal[0]?.total || 0,
                lastMonth: lastMonthTotal[0]?.total || 0,
                allTime: allTimeTotal[0]?.total || 0,
            });
        } catch (error) {
            console.error("Lỗi khi lấy tổng doanh thu:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },
};


module.exports = OrderController;
