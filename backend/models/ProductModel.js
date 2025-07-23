const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  specs: { type: Object, default: {} }, // Nested object for all specs
  saleEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleEvent', default: null },
  stock: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', ProductSchema);