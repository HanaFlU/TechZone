const mongoose = require('mongoose');
const shortid = require("shortid");

const specSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, default: "" },
}, { _id: false });


const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      default: shortid.generate,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: ['/default-product-image.png'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCategory',
    },
    specs: [specSchema],
    saleEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SaleEvent',
      default: null,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', ProductSchema);
