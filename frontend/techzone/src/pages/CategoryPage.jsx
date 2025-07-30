import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import CategoryService from '../services/CategoryService';
import ReviewService from '../services/ReviewService';
import ProductCard from '../components/product/ProductCard';
import ProductFilter from '../components/product/ProductFilter';
import useNotification from '../hooks/useNotification';
import useAuthUser from '../hooks/useAuthUser';
import useAddToCart from '../hooks/useAddToCart';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { displayNotification } = useNotification();
  const { currentUserId } = useAuthUser();
  const { addToCart } = useAddToCart();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store original unfiltered products
  const [availableSpecs, setAvailableSpecs] = useState([]); // Store available specifications
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false); // Separate loading state for filters
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sort: 'name',
    order: 'asc',
    priceRange: null,
    specs: null
  });

  // Debounce timer for filter changes
  const [filterDebounceTimer, setFilterDebounceTimer] = useState(null);

  // Load original unfiltered products once when category is first loaded
  useEffect(() => {
    const fetchOriginalProducts = async () => {
      try {
        // Get original products without any price filtering
        const response = await CategoryService.getProductsByCategory(slug, {
          page: 1,
          limit: 1000, // Get all products
          sort: 'name',
          order: 'asc'
        });
        
        if (response.success) {
          setAllProducts(response.data.products);
        }
      } catch (err) {
        console.error('Error fetching original products:', err);
      }
    };

    if (slug && allProducts.length === 0) {
      fetchOriginalProducts();
    }
  }, [slug, allProducts.length]);

  // Load available specifications for the category
  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        const response = await CategoryService.getCategorySpecifications(slug);
        if (response.success) {
          setAvailableSpecs(response.data);
        }
      } catch (err) {
        console.error('Error fetching specifications:', err);
        setAvailableSpecs([]);
      }
    };

    if (slug) {
      fetchSpecifications();
    }
  }, [slug]);

  // Initial category and products load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if this is a featured products request
        const ratingFilter = searchParams.get('rating');
        const isFeaturedProducts = slug === 'featured' && ratingFilter === '4-5';
        
        if (isFeaturedProducts) {
          // Fetch featured products with high ratings
          const featuredProducts = await ReviewService.getProductsWithHighRatings(4, 20);
          setCategory({
            name: 'Sản phẩm nổi bật',
            description: 'Các sản phẩm có đánh giá cao'
          });
          setProducts(featuredProducts);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalProducts: featuredProducts.length,
            hasNextPage: false,
            hasPrevPage: false
          });
        } else {
          // Get category info and initial products
          const response = await CategoryService.getProductsByCategory(slug, {
            page: 1,
            limit: 20,
            sort: 'name',
            order: 'asc'
          });
          
          if (response.success) {
            setCategory(response.data.category);
            setProducts(response.data.products);
            setPagination(response.data.pagination);
          } else {
            setError('Failed to load category data');
          }
        }
      } catch (err) {
        console.error('Error fetching initial category data:', err);
        if (err.response && err.response.status === 404) {
          setError('Category not found');
        } else {
          setError('Failed to load category data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchInitialData();
    }
  }, [slug, searchParams]);

  // Handle filter changes (separate from initial load)
  useEffect(() => {
    const fetchFilteredData = async () => {
      // Skip if this is the initial load (category is null)
      if (!category) return;
      
      // Check if this is featured products
      const ratingFilter = searchParams.get('rating');
      const isFeaturedProducts = slug === 'featured' && ratingFilter === '4-5';
      
      if (isFeaturedProducts) {
        // For featured products, we'll do client-side filtering since we already have all the data
        try {
          setFilterLoading(true);
          
          // Get all featured products again (we could optimize this by storing the original data)
          const featuredProducts = await ReviewService.getProductsWithHighRatings(4, 100); // Get more products for filtering
          
          // Apply client-side filtering
          let filteredProducts = [...featuredProducts];
          
          // Apply price filter
          if (filters.priceRange) {
            filteredProducts = filteredProducts.filter(product => 
              product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
            );
          }
          
          // Apply sorting
          filteredProducts.sort((a, b) => {
            switch (filters.sort) {
              case 'name':
                return filters.order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
              case 'price':
                return filters.order === 'asc' ? a.price - b.price : b.price - a.price;
              case 'createdAt':
                return filters.order === 'asc' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
              default:
                return 0;
            }
          });
          
          // Apply pagination
          const startIndex = (filters.page - 1) * filters.limit;
          const endIndex = startIndex + filters.limit;
          const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
          
          setProducts(paginatedProducts);
          setPagination({
            currentPage: filters.page,
            totalPages: Math.ceil(filteredProducts.length / filters.limit),
            totalProducts: filteredProducts.length,
            hasNextPage: endIndex < filteredProducts.length,
            hasPrevPage: filters.page > 1
          });
        } catch (err) {
          console.error('Error filtering featured products:', err);
        } finally {
          setFilterLoading(false);
        }
      } else {
        // Regular category filtering
        try {
          setFilterLoading(true);
          
          // Get filtered products
          const response = await CategoryService.getProductsByCategory(slug, filters);
          
          if (response.success) {
            setProducts(response.data.products);
            setPagination(response.data.pagination);
          }
        } catch (err) {
          console.error('Error fetching filtered data:', err);
        } finally {
          setFilterLoading(false);
        }
      }
    };

    if (slug && category) {
      fetchFilteredData();
    }
  }, [slug, filters.page, filters.limit, filters.sort, filters.order, filters.priceRange, filters.specs, category, searchParams]);

  // Cleanup filter debounce timer on unmount
  useEffect(() => {
    return () => {
      if (filterDebounceTimer) {
        clearTimeout(filterDebounceTimer);
      }
    };
  }, [filterDebounceTimer]);

  // Calculate maximum price from original unfiltered products
  const maxPrice = React.useMemo(() => {
    // Use allProducts (unfiltered) instead of products (filtered)
    const productsToUse = allProducts.length > 0 ? allProducts : products;
    
    if (!productsToUse || productsToUse.length === 0) return 10000000; // Default max price
    
    // Find the highest price among all products
    const highestPrice = Math.max(...productsToUse.map(product => product.price || 0));
    
    // Round up to the nearest whole number (e.g., 1234567 -> 1235000)
    // This makes the slider more user-friendly
    const roundedMaxPrice = Math.ceil(highestPrice / 100000) * 100000;
    
    return roundedMaxPrice;
  }, [allProducts, products]);

  // Add to Cart handler
  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (newSort, newOrder) => {
    setFilters(prev => ({ ...prev, sort: newSort, order: newOrder, page: 1 }));
  };

  const handleLimitChange = (newLimit) => {
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    // Clear existing timer
    if (filterDebounceTimer) {
      clearTimeout(filterDebounceTimer);
    }

    // Set new timer for debounced filter update
    const timer = setTimeout(() => {
      setFilters(newFilters);
    }, 800); // Increased to 800ms for better performance

    setFilterDebounceTimer(timer);
  };

  const handleClearFilters = () => {
    // Clear any pending timer
    if (filterDebounceTimer) {
      clearTimeout(filterDebounceTimer);
      setFilterDebounceTimer(null);
    }

    setFilters({
      page: 1,
      limit: filters.limit,
      sort: filters.sort,
      order: filters.order,
      priceRange: null,
      specs: null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested category could not be found'}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-light-green text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600"
              >
                Trang chủ
              </button>
            </li>
            {category.hierarchy && category.hierarchy.map((cat, index) => (
              <li key={cat._id}>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  {index === category.hierarchy.length - 1 ? (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {cat.name}
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(`/category/${cat.slug}`)}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-emerald-600 md:ml-2"
                    >
                      {cat.name}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Main Content with Filter Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ProductFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              maxPrice={maxPrice}
              availableSpecs={availableSpecs}
              // brands={brands} // Removed as per edit hint
            />
          </div>

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Sorting and Pagination Controls */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleSortChange(sort, order);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="createdAt-desc">Mới nhất</option>
                </select>
                <span className="text-sm text-gray-500">
                  {pagination.totalProducts} sản phẩm
                </span>
              </div>
              
              {pagination.totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-600">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {filterLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
            
                {/* Bottom Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Trước
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm border rounded-md ${
                              pageNum === pagination.currentPage
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600">Không có sản phẩm nào trong danh mục này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;