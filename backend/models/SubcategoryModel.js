const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  group: { type: String } // e.g., "Intel", "AMD", "Brand", "DDR4", etc.
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);