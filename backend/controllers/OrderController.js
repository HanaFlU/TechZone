const Order = require('../models/OrderModel.js');
const Cart = require('../models/CartModel.js');
const Product = require('../models/ProductModel.js');

function generateRandomOrderId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Hàm trợ giúp để tạo orderId duy nhất (kiểm tra trong DB)
const generateUniqueOrderId = async () => {
    let isUnique = false;
    let generatedId;
    while (!isUnique) {
        generatedId = generateRandomOrderId(10); // Tạo ID ngẫu nhiên 10 ký tự
        const existingOrder = await Order.findOne({ orderId: generatedId }); // Kiểm tra xem ID đã tồn tại trong DB chưa
        if (!existingOrder) {
            isUnique = true; // Nếu không tìm thấy, ID này là duy nhất
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
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
            }

            res.status(200).json(order);
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng.' });
        }
    },
    createOrder: async (req, res) => {
        const { customerId, shippingAddressId, paymentMethod } = req.body;

        console.log('Received request to create order:', { customerId, shippingAddressId, paymentMethod });

        if (!customerId || !shippingAddressId || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields: customerId, shippingAddressId, paymentMethod.' });
        }

        try {
            const cart = await Cart.findOne({ customer: customerId }).populate('items.product');
            if (!cart || cart.items.length === 0) {
                return res.status(404).json({ message: 'Cart not found or is empty for this customer.' });
            }

            let totalAmount = 0;
            const orderItems = [];

            for (const cartItem of cart.items) {
                const product = cartItem.product;
                const quantity = cartItem.quantity;

                if (!product) {
                    console.warn(`Product with ID ${cartItem.product._id} not found in database for cart item.`);
                    return res.status(400).json({ message: `Product not found for item in cart: ${cartItem.product._id}. Please review your cart.` });
                }

                // Kiểm tra tồn kho
                if (product.stock < quantity) {
                    return res.status(400).json({ message: `Không đủ số lượng sản phẩm ${product.name} để đặt hàng. Kho: ${product.stock}, Số lượng đặt hàng: ${quantity}` });
                }

                // <<< LẤY GIÁ TẠI THỜI ĐIỂM HIỆN TẠI VÀ LƯU VÀO orderItems >>>
                const priceAtOrder = product.price; // Lấy giá hiện tại của sản phẩm
                totalAmount += priceAtOrder * quantity; // Tính tổng tiền dựa trên giá này

                orderItems.push({
                    product: product._id,
                    quantity: quantity,
                    priceAtOrder: priceAtOrder // <<< LƯU GIÁ TẠI THỜI ĐIỂM ĐẶT HÀNG
                });
            }

            const newOrderId = await generateUniqueOrderId();
            const newOrder = new Order({
                orderId: newOrderId,
                customer: customerId,
                items: orderItems,
                shippingAddress: shippingAddressId,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                status: 'PENDING',
            });

            const savedOrder = await newOrder.save();

            for (const orderItem of orderItems) {
                await Product.findByIdAndUpdate(
                    orderItem.product,
                    { $inc: { stock: -orderItem.quantity } }
                );
            }

            await Cart.findByIdAndDelete(cart._id);

            const populatedOrder = await Order.findById(savedOrder._id)
            res.status(201).json({ message: 'Order created successfully!', order: populatedOrder });

        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ message: 'Server error during order creation.', error: error.message });
        }
    },
};


module.exports = OrderController;
