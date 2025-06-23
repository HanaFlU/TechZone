const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: String,
    // customer: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Customer",
    //     required: true,
    // },
    // items: [
    //     {
    //         product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    //         quantity: Number,
    //     },
    // ],
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "PENDING",
    },
    // shippingAddress: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Address",
    //     required: true,
    // },
    paymentMethod: {
        type: String,
        enum: ["COD", "BANK_TRANSFER", "E-WALLET"],
        default: "COD",
    },
    orderDate: { type: Date, default: Date.now },
    totalAmount: Number,
});

// module.exports = mongoose.model('Order', orderSchema);

const OrderModel = mongoose.model("Order", orderSchema, "orders");
module.exports = OrderModel;