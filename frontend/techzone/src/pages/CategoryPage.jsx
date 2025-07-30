import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CategoryService from '../services/CategoryService';
import ProductService from '../services/ProductService';
import ProductCard from '../components/product/ProductCard';
import ProductFilter from '../components/product/ProductFilter';
import useNotification from '../hooks/useNotification';
import useAuthUser from '../hooks/useAuthUser';
import useAddToCart from '../hooks/useAddToCart';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setShowLoginModal } = useContext(AuthContext);
  const { displayNotification } = useNotification();
  const { currentUserId } = useAuthUser();
  const { addToCart } = useAddToCart();
  
  // Check if this is a featured products page (rating filter)
  const isFeaturedPage = slug === 'featured';
  const ratingFilter = searchParams.get('rating');
  const searchQuery = searchParams.get('search');
  const isSearchPage = searchQuery && searchQuery.trim() !== '';
  
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
        let response;
        
        if (isSearchPage) {
          // For search page, get all products and filter by search query
          const allProductsResponse = await ProductService.getAllProducts();
          const allProducts = allProductsResponse || [];
          
          // Filter products by search query
          const searchTerm = searchQuery.toLowerCase().trim();
          const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
          
          const searchResults = allProducts.filter(product => {
            const productName = product.name?.toLowerCase() || '';
            const productDescription = product.description?.toLowerCase() || '';
            const categoryName = product.category?.name?.toLowerCase() || '';
            
            // Get all specs labels and values as searchable text
            const specsText = product.specs?.map(spec => 
              `${spec.label?.toLowerCase() || ''} ${spec.value?.toLowerCase() || ''}`
            ).join(' ') || '';
            
            // Combine all searchable text
            const searchableText = `${productName} ${productDescription} ${categoryName} ${specsText}`;
            
            // Check if all search words are found in the combined searchable text
            return searchWords.every(word => searchableText.includes(word));
          });
          
          setAllProducts(searchResults);
        } else if (isFeaturedPage && ratingFilter) {
          // For featured page, get all products and filter by rating
          const allProductsResponse = await ProductService.getAllProducts();
          const allProducts = allProductsResponse || [];
          
          // Filter products with 4-5 star ratings
          const featuredProducts = allProducts.filter(product => {
            if (!product.reviews || product.reviews.length === 0) return false;
            
            // Calculate average rating
            const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / product.reviews.length;
            
            return averageRating >= 4;
          });
          
          setAllProducts(featuredProducts);
        } else {
          // For regular category pages
          response = await CategoryService.getProductsByCategory(slug, {
          page: 1,
          limit: 1000, // Get all products
          sort: 'name',
          order: 'asc'
        });
        
        if (response.success) {
          setAllProducts(response.data.products);
          }
        }
      } catch (err) {
        console.error('Error fetching original products:', err);
      }
    };

    if (slug && allProducts.length === 0) {
      fetchOriginalProducts();
    }
  }, [slug, allProducts.length, isFeaturedPage, ratingFilter, searchQuery]);

  // Load available specifications for the category
  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        // Skip specifications for featured page and search page
        if (isFeaturedPage || isSearchPage) {
          setAvailableSpecs([]);
          return;
        }
        
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
  }, [slug, isFeaturedPage, isSearchPage]);

  // Initial category and products load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (isSearchPage) {
          // For search page, get all products and filter by search query
          try {
            const allProductsResponse = await ProductService.getAllProducts();
            const allProducts = allProductsResponse || [];
            
            // Filter products by search query
            const searchTerm = searchQuery.toLowerCase().trim();
            const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
            
            const searchResults = allProducts.filter(product => {
              const productName = product.name?.toLowerCase() || '';
              const productDescription = product.description?.toLowerCase() || '';
              const categoryName = product.category?.name?.toLowerCase() || '';
              
              // Get all specs labels and values as searchable text
              const specsText = product.specs?.map(spec => 
                `${spec.label?.toLowerCase() || ''} ${spec.value?.toLowerCase() || ''}`
              ).join(' ') || '';
              
              // Combine all searchable text
              const searchableText = `${productName} ${productDescription} ${categoryName} ${specsText}`;
              
              // Check if all search words are found in the combined searchable text
              return searchWords.every(word => searchableText.includes(word));
            });
            
            // Create a mock category for search results
            setCategory({
              name: `Kết quả tìm kiếm: "${searchQuery}"`,
              description: '',
              slug: 'search'
            });
            
            // Apply pagination manually
            const page = 1;
            const limit = 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedProducts = searchResults.slice(startIndex, endIndex);
            
            setProducts(paginatedProducts);
            setAllProducts(searchResults);
            setPagination({
              currentPage: page,
              totalPages: Math.ceil(searchResults.length / limit),
              totalProducts: searchResults.length,
              hasNextPage: endIndex < searchResults.length,
              hasPrevPage: page > 1
            });
            
            response = { success: true }; // Mark as successful
          } catch (productErr) {
            console.error('Error fetching search results:', productErr);
            response = { success: false };
          }
        } else if (isFeaturedPage && ratingFilter) {
          // For featured page, get all products and filter by rating
          try {
            const allProductsResponse = await ProductService.getAllProducts();
            const allProducts = allProductsResponse || [];
            
            // Filter products with 4-5 star ratings
            const featuredProducts = allProducts.filter(product => {
              if (!product.reviews || product.reviews.length === 0) return false;
              
              // Calculate average rating
              const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
              const averageRating = totalRating / product.reviews.length;
              
              return averageRating >= 4;
            });
            
            // Create a mock category for featured products
            setCategory({
              name: 'Sản phẩm nổi bật',
              description: 'Các sản phẩm được đánh giá cao',
              slug: 'featured'
            });
            
            // Apply pagination manually
            const page = 1;
            const limit = 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedProducts = featuredProducts.slice(startIndex, endIndex);
            
            setProducts(paginatedProducts);
            setAllProducts(featuredProducts);
            setPagination({
              currentPage: page,
              totalPages: Math.ceil(featuredProducts.length / limit),
              totalProducts: featuredProducts.length,
              hasNextPage: endIndex < featuredProducts.length,
              hasPrevPage: page > 1
            });
            
            response = { success: true }; // Mark as successful
          } catch (productErr) {
            console.error('Error fetching featured products:', productErr);
            response = { success: false };
          }
        } else {
          // For regular category pages
          response = await CategoryService.getProductsByCategory(slug, {
          page: 1,
          limit: 20,
          sort: 'name',
          order: 'asc'
        });
        
        if (response.success) {
          setCategory(response.data.category);
          setProducts(response.data.products);
          setPagination(response.data.pagination);
          }
        }
        
        if (!response.success) {
          setError('Failed to load category data');
        }
      } catch (err) {
        console.error('Error fetching initial category data:', err);
        if (err.response && err.response.status === 404 && !isFeaturedPage) {
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
  }, [slug, isFeaturedPage, ratingFilter, searchQuery]);

  // Handle filter changes (separate from initial load)
  useEffect(() => {
    const fetchFilteredData = async () => {
      // Skip if this is the initial load (category is null)
      if (!category) return;
      
      try {
        setFilterLoading(true);
        
        let response;
        
        if (isSearchPage) {
          // For search page, filter from allProducts (already filtered by search)
          const { page, limit, sort, order } = filters;
          
          // Apply sorting
          let sortedProducts = [...allProducts];
          if (sort === 'name') {
            sortedProducts.sort((a, b) => {
              const nameA = a.name.toLowerCase();
              const nameB = b.name.toLowerCase();
              return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
          } else if (sort === 'price') {
            sortedProducts.sort((a, b) => {
              return order === 'asc' ? a.price - b.price : b.price - a.price;
            });
          }
          
          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
          
          setProducts(paginatedProducts);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(sortedProducts.length / limit),
            totalProducts: sortedProducts.length,
            hasNextPage: endIndex < sortedProducts.length,
            hasPrevPage: page > 1
          });
          
          response = { success: true };
        } else if (isFeaturedPage && ratingFilter) {
          // For featured page, filter from allProducts (already filtered by rating)
          const { page, limit, sort, order } = filters;
          
          // Apply sorting
          let sortedProducts = [...allProducts];
          if (sort === 'name') {
            sortedProducts.sort((a, b) => {
              const nameA = a.name.toLowerCase();
              const nameB = b.name.toLowerCase();
              return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
          } else if (sort === 'price') {
            sortedProducts.sort((a, b) => {
              return order === 'asc' ? a.price - b.price : b.price - a.price;
            });
          }
          
          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
          
          setProducts(paginatedProducts);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(sortedProducts.length / limit),
            totalProducts: sortedProducts.length,
            hasNextPage: endIndex < sortedProducts.length,
            hasPrevPage: page > 1
          });
          
          response = { success: true };
        } else {
          // For regular category pages
          response = await CategoryService.getProductsByCategory(slug, filters);
        
        if (response.success) {
          setProducts(response.data.products);
          setPagination(response.data.pagination);
          }
        }
      } catch (err) {
        console.error('Error fetching filtered data:', err);
      } finally {
        setFilterLoading(false);
      }
    };

    if (slug && category) {
      fetchFilteredData();
    }
  }, [slug, filters.page, filters.limit, filters.sort, filters.order, filters.priceRange, filters.specs, category, isFeaturedPage, ratingFilter, searchQuery]);

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
    <div className="min-h-screen bg-gray-50 cursor-pointer-all">
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
            {isSearchPage ? (
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Kết quả tìm kiếm
                  </span>
                </div>
              </li>
            ) : isFeaturedPage ? (
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Sản phẩm nổi bật
                  </span>
                </div>
              </li>
            ) : (
              category.hierarchy && category.hierarchy.map((cat, index) => (
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
              ))
            )}
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
                <div className="flex items-center space-x-2 pagination">
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
                    <div key={product._id} className="product-card">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                    </div>
                  ))}
                </div>
            
                {/* Bottom Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2 pagination">
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