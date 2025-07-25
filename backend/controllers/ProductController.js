const Product = require('../models/ProductModel');
const Category = require('../models/CategoryModel');
const SaleEvent = require('../models/SaleEventModel');
const findRootCategory = require('../helpers/findRootCategory');
const getAllDescendantCategoryIds = require('../helpers/getAllDescendantCategoryIds');
const generateKeyFromLabel = require('../helpers/generateKeyFromeLabel');

const ProductController = {
  createProduct: async (req, res) => {
    try {
      const createWithId = async (data) => {
        const category = await Category.findById(data.category);
        if (!category) throw new Error("Không tìm thấy danh mục");

        const rootCategory = await findRootCategory(category._id);
        const root = await Category.findById(rootCategory);
        const baseSpecs = rootCategory?.specifications || [];

        // Tạo spec từ danh mục gốc
        const inheritedSpecs = (baseSpecs).map((spec) => {
          const key = spec.key || generateKeyFromLabel(spec.label);
          return {
            key,
            label: spec.label,
            value: data.spec?.find((s) => s.key === key)?.value || "",
          };
        });

        const userSpecs = (data.spec || []).map((s) => ({
          ...s,
          key: s.key || generateKeyFromLabel(s.label),
        }));

        return {
          ...data,
          spec: inheritedSpecs.concat( // nối các spec riêng
            userSpecs.filter(
              (s) => !inheritedSpecs.find((inherited) => inherited.key === s.key)
            )
          ),
        };
      };

      let result;

      if (Array.isArray(req.body)) {
        const payloadPromises = req.body.map(createWithId);
        const payload = await Promise.all(payloadPromises);
        result = await Product.insertMany(payload);
      } else {
        const productData = await createWithId(req.body);
        result = await Product.create(productData);
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

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id)
        .populate('category', 'name')
        .populate('saleEvent');

      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }

      res.json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await Product.findById(id); // thiếu await ở đây

      if (!product) {
        return res.status(400).json({ message: "Product not found." }); // sửa massage → message
      }
      console.log(updateData.category)
      const category = await Category.findById(
        updateData.category?._id || product.category?._id || product.category
      );

      if (!category) {
        return res.status(400).json({ message: "Product's category not found." });
      }

      const rootCategory = await findRootCategory(category._id);
      const baseSpecs = rootCategory?.specifications || [];

      const inheritedSpecs = baseSpecs.map((spec) => {
        const key = spec.key || generateKeyFromLabel(spec.label);
        return {
          key,
          label: spec.label,
          value:
            updateData.specs?.find((s) => s.key === key)?.value ??
            product.specs?.find((s) => s.key === key)?.value ??
            "",
        };
      });
      const userSpecs = (updateData.specs || []).map((s) => ({
        ...s,
        key: s.key || generateKeyFromLabel(s.label),
      }));
      const extraSpecs = (userSpecs || []).filter(
        (s) => !inheritedSpecs.find((inherited) => inherited.key === s.key)
      );

      updateData.specs = [...inheritedSpecs, ...extraSpecs];
      const updated = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: "Product not found." });
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
