const Product = require('../models/ProductModel');
const Category = require('../models/CategoryModel');
const SaleEvent = require('../models/SaleEventModel');

const ProductController = {
  createProduct: async (req, res) => {
    try {
      const createWithId = (data) => ({
        ...data
      });

      let result;

      if (Array.isArray(req.body)) {
        const payload = req.body.map(createWithId);
        result = await Product.insertMany(payload);
      } else {
        result = await Product.create(createWithId(req.body));
      }

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find()
        .populate('category', 'name')
        .populate('saleEvent');
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const updated = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await Product.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }

      res.json({ success: true, message: 'Đã xoá sản phẩm' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
module.exports = ProductController;

