const Category = require('../models/CategoryModel');
const slugify = require('slugify');

exports.createCategory = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      // create slug for each category if don't have one
      if (req.body.some(category => !category.slug)) {
        req.body.forEach(category => {
          category.slug = slugify(category.name, { lower: true });
        });
      }
      // Bulk insert
      const categories = await Category.insertMany(req.body);
      res.status(201).json(categories);
    } else {
      // create slug if not provided
      if (!req.body.slug) {
        req.body.slug = slugify(req.body.name, { lower: true });
      }
      // Check if category with the same slug already exists
      const existingCategory = await Category.findOne({ slug: req.body.slug });
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this slug already exists" });
      }
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

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If slug is not provided, generate it
    if (!updateData.slug) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    // Check if category with the same slug already exists
    const existingCategory = await Category.findOne({ slug: updateData.slug, _id: { $ne: id } });
    if (existingCategory) {
      return res.status(400).json({ message: "Category with this slug already exists" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};