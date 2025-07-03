import Order from '../models/OrderModel.js';
import Cart from '../models/CartModel.js';
import Product from '../models/ProductModel.js';

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

        console.log('Nhận yêu cầu tạo đơn hàng:', { customerId, shippingAddressId, paymentMethod });

        if (!customerId || !shippingAddressId || !paymentMethod) {
            return res.status(400).json({ message: 'Thiếu thông tin để tạo đơn hàng!' });
        }

        try {
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
            res.status(201).json({ message: 'Tạo đơn hàng thành công!', order: populatedOrder });

        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.', error: error.message });
        }
    },
};
export default OrderController;
