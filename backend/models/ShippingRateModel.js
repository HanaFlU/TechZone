const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema(
    {
        minOrderValue: {
            type: Number,
        },
        maxOrderValue: {
            type: Number,
        },
        shippingFee: {
            type: Number,
        },
        description: {
            type: String,
        },
    },
);
module.exports = mongoose.model('ShippingRate', shippingRateSchema);
