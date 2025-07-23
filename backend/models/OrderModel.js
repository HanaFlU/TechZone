const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    priceAtOrder: {
        type: Number,
        required: true,
        min: 0,
    }
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        items: [orderItemSchema],
        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
            default: "PENDING",
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                    // required: true
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
            }
        ],
        shippingAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },
        shippingFee: {
            type: Number,
            required: false,
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "CREDIT_CARD", "E_WALLET"],
            default: "COD",
        },
        transactionId: {
            type: String,
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "SUCCESSED", "FAILED", "REFUNDED"],
            default: "PENDING",
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);