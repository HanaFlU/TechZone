const mongoose = require('mongoose');

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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Customer', customerSchema);