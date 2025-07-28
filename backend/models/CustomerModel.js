const mongoose = require('mongoose');
const customerNotificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    oldStatus: {
        type: String,
        required: true,
    },
    newStatus: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const chatMessageSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const customerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        shippingAddresses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Address',
            },
        ],
        notifications: [customerNotificationSchema],
        chatHistory: {
            type: [chatMessageSchema],
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Customer', customerSchema);
