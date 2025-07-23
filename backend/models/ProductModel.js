const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            default: '/default-product-image.png',
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema);