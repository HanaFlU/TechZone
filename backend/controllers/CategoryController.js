const Category = require('../models/CategoryModel');

exports.createCategory = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk insert
      const categories = await Category.insertMany(req.body);
      res.status(201).json(categories);
    } else {
      // Single insert
      const category = await Category.create(req.body);
      res.status(201).json(category);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};