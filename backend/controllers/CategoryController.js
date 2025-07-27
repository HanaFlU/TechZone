const Category = require('../models/CategoryModel');
const Product = require('../models/ProductModel');

const { getAllDescendantCategoryIds, getLeafCategoryIds } = require('../helpers/getAllDescendantCategoryIds');
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

// Get products by category (including all subcategories)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be slug or _id
    const {
      page = 1,
      limit = 20,
      sort = 'name',
      order = 'asc',
      minPrice,
      maxPrice,
      brands,
      minRating,
      availability
    } = req.query;

    // Find the category by slug or _id
    let category = await Category.findOne({ slug: identifier });
    if (!category) {
      category = await Category.findById(identifier);
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
        // Get all leaf category IDs (categories with no children)
    const leafCategoryIds = await getLeafCategoryIds(category._id);

    if (leafCategoryIds.length === 0) {
      // If no leaf categories, use the category itself
      leafCategoryIds.push(category._id.toString());
    }
    
    // Build the query for products
    const query = { category: { $in: leafCategoryIds } };

    // Add price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Add brand filter
    if (brands) {
      const brandArray = Array.isArray(brands) ? brands : [brands];
      query.brand = { $in: brandArray };
    }

    // Add rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Add availability filter
    if (availability) {
      if (availability === 'inStock') {
        query.stock = { $gt: 0 };
      } else if (availability === 'outOfStock') {
        query.stock = { $lte: 0 };
      }
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute the query with pagination and sorting
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
      .exec();
    
    // Get total count for pagination (optimized)
    const totalProducts = await Product.countDocuments(query).exec();
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    
    // Get category hierarchy for breadcrumb
    const categoryHierarchy = await getCategoryHierarchy(category._id);
    
    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          hierarchy: categoryHierarchy
        },
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
    
  } catch (err) {
    console.error('Error getting products by category:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to get category hierarchy (breadcrumb)
const getCategoryHierarchy = async (categoryId) => {
  try {
    const hierarchy = [];
    let currentCategory = await Category.findById(categoryId);
    
    while (currentCategory) {
      hierarchy.unshift({
        _id: currentCategory._id,
        name: currentCategory.name,
        slug: currentCategory.slug
      });
      
      if (currentCategory.parent) {
        currentCategory = await Category.findById(currentCategory.parent);
      } else {
        break;
      }
    }
    
    return hierarchy;
  } catch (error) {
    console.error('Error getting category hierarchy:', error);
    return [];
  }
};
