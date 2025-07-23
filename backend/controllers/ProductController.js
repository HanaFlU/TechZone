const Product = require('../models/ProductModel');

exports.createProduct = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const products = await Product.insertMany(req.body);
      res.status(201).json(products);
    } else {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .populate('brand')
      .populate('specs')
      .populate('saleEvent');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};