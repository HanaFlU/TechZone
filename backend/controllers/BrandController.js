const Brand = require('../models/BrandModel');

exports.createBrand = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const brands = await Brand.insertMany(req.body);
      res.status(201).json(brands);
    } else {
      const brand = await Brand.create(req.body);
      res.status(201).json(brand);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 