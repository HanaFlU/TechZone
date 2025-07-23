const mongoose = require('mongoose');

const SaleEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

module.exports = mongoose.model('SaleEvent', SaleEventSchema); 