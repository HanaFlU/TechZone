const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  // Optionally: logo, description, etc.
});

module.exports = mongoose.model('Brand', BrandSchema); 