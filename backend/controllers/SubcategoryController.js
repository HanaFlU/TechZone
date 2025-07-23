const Subcategory = require('../models/SubcategoryModel');

exports.createSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.create(req.body);
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const subcategories = await Subcategory.find(filter);
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 