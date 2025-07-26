const Category = require('../models/CategoryModel');
const Product = require('../models/ProductModel');

const getAllDescendantCategoryIds = require('../helpers/getAllDescendantCategoryIds');
const { generateSlug, ensureSlug, isDuplicateSlug } = require('../helpers/slugHelper');
const generateKeyFromLabel = require('../helpers/generateKeyFromeLabel');

// Tạo một danh mục hoặc nhiều danh mục
exports.createCategory = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const categoriesWithSlug = req.body.map((category) => ensureSlug(category));
      const inserted = await Category.insertMany(categoriesWithSlug);
      return res.status(201).json(inserted);
    }

    const data = ensureSlug(req.body);
    if (await isDuplicateSlug(data.slug)) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    const category = await Category.create(data);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy tất cả danh mục
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
    const updateData = ensureSlug({ ...req.body });

    if (await isDuplicateSlug(updateData.slug, id)) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    let inheritedSpec = null;
    let deletedKeys = [];

    if (Array.isArray(updateData.specifications)) {
      inheritedSpec = updateData.specifications.map(({ label }) => ({
        label,
        key: generateKeyFromLabel(label),
        value: ''
      }));
      updateData.specifications = inheritedSpec;

      // Lấy danh sách key cũ từ category gốc
      const originalCategory = await Category.findById(id);
      const originalKeys = (originalCategory?.specifications || []).map(s => generateKeyFromLabel(s.label));
      const newKeys = inheritedSpec.map(s => s.key);

      deletedKeys = originalKeys.filter(key => !newKeys.includes(key));
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });

    if (inheritedSpec) {
      const descendantIds = await getAllDescendantCategoryIds(id);
      const allCategoryIds = [id, ...descendantIds];

      // Cập nhật sản phẩm: xóa các spec có key bị xóa và thêm/cập nhật inheritedSpec
      await Product.updateMany(
        { category: { $in: allCategoryIds } },
        [
          {
            $set: {
              specs: {
                $concatArrays: [
                  // Giữ lại các spec KHÔNG bị xóa và KHÔNG trùng key với inheritedSpec (để thay thế)
                  {
                    $filter: {
                      input: "$specs",
                      as: "s",
                      cond: {
                        $and: [
                          { $not: { $in: ["$$s.key", deletedKeys] } },
                          { $not: { $in: ["$$s.key", inheritedSpec.map(s => s.key)] } }
                        ]
                      }
                    }
                  },
                  // Thêm hoặc cập nhật inheritedSpec
                  inheritedSpec
                ]
              }
            }
          }
        ]
      );
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
