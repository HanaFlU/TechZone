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

    // 1. Kiểm tra xem có danh mục con nào không
    const childCategories = await Category.countDocuments({ parent: id });
    if (childCategories > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa danh mục này vì nó có các danh mục con. Vui lòng chuyển các danh mục con sang danh mục khác trước khi xóa.'
      });
    }

    // 2. Kiểm tra xem có sản phẩm nào liên kết với danh mục này không
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa danh mục này vì có sản phẩm liên kết với nó. Vui lòng chuyển các sản phẩm sang danh mục khác hoặc xóa chúng trước khi xóa danh mục.'
      });
    }

    // Nếu không có danh mục con và không có sản phẩm liên kết, tiến hành xóa
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.json({ success: true, message: 'Đã xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
      availability,
      specs
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
    const query = { category: { $in: leafCategoryIds }, status: 'active' };

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

    // Add specifications filter
    if (specs) {
      try {
        const specsFilter = JSON.parse(specs);
        if (Array.isArray(specsFilter) && specsFilter.length > 0) {
          // Group specs by key to handle multiple values per specification
          const specsByKey = {};
          specsFilter.forEach(spec => {
            if (!specsByKey[spec.key]) {
              specsByKey[spec.key] = [];
            }
            specsByKey[spec.key].push(spec.value);
          });
          
          // Build specs query - products must match ALL specified spec keys
          // For each spec key, product must match ANY of the specified values (OR logic)
          const specsQueries = Object.entries(specsByKey).map(([key, values]) => ({
            'specs': {
              $elemMatch: {
                key: key,
                value: { $in: values } // OR logic for multiple values of same spec
              }
            }
          }));
          
          // Combine all specs queries with AND logic
          query.$and = specsQueries;
        }
      } catch (err) {
        console.error('Error parsing specs filter:', err);
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
      .lean();
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
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

// Get available specifications for a category
exports.getCategorySpecifications = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be slug or _id
    
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

    // Get all products in this category and its subcategories
    const products = await Product.find({ 
      category: { $in: leafCategoryIds },
      status: 'active'
    }).select('specs').lean();

    // Extract unique specifications
    const specsMap = new Map();
    
    products.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach(spec => {
          if (spec.key && spec.label && spec.value && spec.value.trim() !== '') {
            const key = spec.key;
            const label = spec.label;
            
            if (!specsMap.has(key)) {
              specsMap.set(key, {
                key: key,
                label: label,
                values: new Set()
              });
            }
            
            specsMap.get(key).values.add(spec.value.trim());
          }
        });
      }
    });

    // Convert to array format
    const availableSpecs = Array.from(specsMap.values()).map(spec => ({
      key: spec.key,
      label: spec.label,
      values: Array.from(spec.values).sort()
    }));

    res.json({
      success: true,
      data: availableSpecs
    });
  } catch (err) {
    console.error('Error getting category specifications:', err);
    res.status(500).json({ success: false, message: err.message });
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
