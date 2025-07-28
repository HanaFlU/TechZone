const Product = require('../models/ProductModel');
const Category = require('../models/CategoryModel');
const SaleEvent = require('../models/SaleEventModel');
const findRootCategory = require('../helpers/findRootCategory');
const getAllDescendantCategoryIds = require('../helpers/getAllDescendantCategoryIds');
const generateKeyFromLabel = require('../helpers/generateKeyFromeLabel');
const Order = require('../models/OrderModel');

const ProductController = {

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find({ status: 'active' })
        .populate('category')
        .populate('saleEvent');
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findOne({ _id: id, status: 'active' })
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

  adminGetAllProducts: async (req, res) => {
    try {
      const products = await Product.find()
        .populate('category')
        .populate('saleEvent');
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  adminGetProductById: async (req, res) => {
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
            value: data.specs?.find((s) => s.key === key)?.value || "",
          };
        });

        const userSpecs = (data.specs || []).map((s) => ({
          ...s,
          key: s.key || generateKeyFromLabel(s.label),
        }));

        return {
          ...data,
          specs: inheritedSpecs.concat( // nối các spec riêng
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
  },

  bulkUpdateProducts: async (req, res) => {
    try {
      const { productIds, updateData } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ success: false, message: 'No product IDs provided for bulk update.' });
      }

      // If updating category, we need to handle specs inheritance
      if (updateData.category) {
        const updatePromises = productIds.map(async (id) => {
          const product = await Product.findById(id);
          if (!product) {
            console.warn(`Product with ID ${id} not found. Skipping.`);
            return null;
          }

          const category = await Category.findById(updateData.category);
          if (!category) {
            console.warn(`Category with ID ${updateData.category} not found for product ${id}. Skipping update.`);
            return null; // Pass
          }

          const rootCategory = await findRootCategory(category._id);
          const baseSpecs = rootCategory?.specifications || [];

          const inheritedSpecs = baseSpecs.map((spec) => {
            const key = spec.key || generateKeyFromLabel(spec.label);
            const existingSpec = product.specs?.find((s) => s.key === key);
            return {
              key,
              label: spec.label,
              value: existingSpec ? existingSpec.value : "",
            };
          });

          const userDefinedExistingSpecs = (product.specs || [])
            .filter((s) => !inheritedSpecs.some((inherited) => inherited.key === s.key))
            .map(s => ({
              ...s,
              key: s.key || generateKeyFromLabel(s.label)
            }));


          const finalSpecs = [...inheritedSpecs, ...userDefinedExistingSpecs];

          return Product.findByIdAndUpdate(id, { ...updateData, specs: finalSpecs }, { new: true, runValidators: true });
        });

        const updatedProducts = await Promise.all(updatePromises);
        res.json({ success: true, message: 'Products updated successfully.', data: updatedProducts.filter(p => p !== null) });
      } else {
        // For other updates (like status), directly update
        const result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: updateData },
          { runValidators: true }
        );
        res.json({ success: true, message: `${result.modifiedCount} products updated successfully.`, data: result });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // New function for bulk deleting products
  bulkDeleteProducts: async (req, res) => {
    try {
      const { productIds } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ success: false, message: 'No product IDs provided for bulk deletion.' });
      }

      const result = await Product.deleteMany({ _id: { $in: productIds } });

      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'No products found to delete.' });
      }

      res.json({ success: true, message: `Successfully deleted ${result.deletedCount} products.` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },


  getTopSellingProducts: async (req, res) => {
    try {
      const { limit = 5, sortBy = 'revenue' } = req.query; // sortBy có thể là 'revenue' hoặc 'quantity'

      const aggregationPipeline = [
        // Giai đoạn 1: Lấy tất cả các đơn hàng và bung các sản phẩm trong đó
        { $unwind: '$items' },
        // Giai đoạn 2: Nhóm theo ID sản phẩm để tính tổng doanh thu và số lượng bán
        {
          $group: {
            _id: '$items.product',
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.priceAtOrder'] } },
            totalSoldQuantity: { $sum: '$items.quantity' },
          },
        },
        // Giai đoạn 3: Lookup để lấy thông tin chi tiết về sản phẩm
        {
          $lookup: {
            from: 'products', // Tên collection của ProductModel
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        // Giai đoạn 4: Bung mảng productInfo (vì lookup trả về mảng)
        { $unwind: '$productInfo' },

        // Giai đoạn 5: Lookup để lấy thông tin chi tiết về Category của sản phẩm
        {
          $lookup: {
            from: 'testcategories', // Tên collection của CategoryModel
            localField: 'productInfo.category',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        // Giai đoạn 6: Bung mảng categoryInfo (vì lookup trả về mảng)
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } }, // preserveNullAndEmptyArrays để tránh loại bỏ sản phẩm không có category

        // Giai đoạn 7: Sắp xếp theo tiêu chí (doanh thu hoặc số lượng)
        {
          $sort: {
            [sortBy === 'revenue' ? 'totalRevenue' : 'totalSoldQuantity']: -1, // Sắp xếp giảm dần
          },
        },
        // Giai đoạn 8: Giới hạn số lượng kết quả
        { $limit: parseInt(limit) },
        // Giai đoạn 9: Chọn các trường muốn hiển thị
        {
          $project: {
            _id: 0,
            productId: '$productInfo.productId',
            productName: '$productInfo.name',
            productImage: { $arrayElemAt: ['$productInfo.images', 0] }, // Lấy ảnh đầu tiên
            productPrice: '$productInfo.price', // Lấy giá sản phẩm
            categoryName: '$categoryInfo.name', // Lấy tên danh mục
            totalRevenue: 1,
            totalSoldQuantity: 1,
          },
        },
      ];

      const topProducts = await Order.aggregate(aggregationPipeline);

      res.json({ success: true, data: topProducts });
    } catch (err) {
      console.error('Error fetching top selling products:', err);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo sản phẩm.', error: err.message });
    }
  },

  generateMissingSpecKeys: async (req, res) => {
    try {
      const productsToUpdate = await Product.find({
        "specs.key": { $exists: false } // Find products where at least one spec is missing 'key'
      });

      let updatedCount = 0;
      for (const product of productsToUpdate) {
        let changed = false;
        const newSpecs = product.specs.map(spec => {
          if (!spec.key && spec.label) { // If key is missing but label exists
            changed = true;
            return {
              ...spec._doc, // Use _doc to get plain object if spec is a Mongoose subdocument
              key: generateKeyFromLabel(spec.label)
            };
          }
          return spec._doc || spec; // Return original spec if no change, handle subdocument or plain object
        });

        if (changed) {
          product.specs = newSpecs;
          await product.save({ validateBeforeSave: true }); // Validate to ensure new keys are valid
          updatedCount++;
        }
      }

      res.json({
        success: true,
        message: `Successfully generated missing spec keys for ${updatedCount} products.`,
        details: {
          productsChecked: productsToUpdate.length,
          productsUpdated: updatedCount
        }
      });
    } catch (err) {
      console.error("Error generating missing spec keys:", err);
      res.status(500).json({ success: false, message: "Error generating missing spec keys.", error: err.message });
    }
  },
};
module.exports = ProductController;
