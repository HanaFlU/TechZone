import React, { useState } from 'react';

const ProductFilter = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  brands = [],
  priceRanges = [
    { label: 'Dưới 500.000đ', min: 0, max: 500000 },
    { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
    { label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
    { label: '2.000.000đ - 5.000.000đ', min: 2000000, max: 5000000 },
    { label: 'Trên 5.000.000đ', min: 5000000, max: null }
  ],
  ratings = [5, 4, 3, 2, 1]
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    rating: true,
    availability: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceRangeChange = (range) => {
    onFilterChange({
      ...filters,
      priceRange: range,
      page: 1
    });
  };

  const handleBrandChange = (brand) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    
    onFilterChange({
      ...filters,
      brands: newBrands,
      page: 1
    });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({
      ...filters,
      minRating: rating,
      page: 1
    });
  };

  const handleAvailabilityChange = (availability) => {
    onFilterChange({
      ...filters,
      availability,
      page: 1
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bộ lọc sản phẩm</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-medium text-gray-900">Khoảng giá</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.price && (
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange?.min === range.min && filters.priceRange?.max === range.max}
                  onChange={() => handlePriceRangeChange(range)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-medium text-gray-900">Thương hiệu</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              expandedSections.brand ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.brand && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(brand) || false}
                  onChange={() => handleBrandChange(brand)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-medium text-gray-900">Đánh giá</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              expandedSections.rating ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.rating && (
          <div className="space-y-2">
            {ratings.map((rating) => (
              <label key={rating} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <div className="ml-2 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-700">trở lên</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-medium text-gray-900">Tình trạng</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              expandedSections.availability ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.availability && (
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availability === 'inStock'}
                onChange={() => handleAvailabilityChange('inStock')}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="ml-2 text-sm text-gray-700">Còn hàng</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availability === 'outOfStock'}
                onChange={() => handleAvailabilityChange('outOfStock')}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="ml-2 text-sm text-gray-700">Hết hàng</span>
            </label>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(filters.priceRange || filters.brands?.length > 0 || filters.minRating || filters.availability) && (
        <div className="pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Bộ lọc đang áp dụng:</h4>
          <div className="space-y-1">
            {filters.priceRange && (
              <div className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                <span>Giá: {filters.priceRange.label}</span>
                <button
                  onClick={() => onFilterChange({ ...filters, priceRange: null })}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
            {filters.brands?.map((brand) => (
              <div key={brand} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                <span>Thương hiệu: {brand}</span>
                <button
                  onClick={() => handleBrandChange(brand)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            {filters.minRating && (
              <div className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                <span>Đánh giá: {filters.minRating} sao trở lên</span>
                <button
                  onClick={() => onFilterChange({ ...filters, minRating: null })}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
            {filters.availability && (
              <div className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                <span>Tình trạng: {filters.availability === 'inStock' ? 'Còn hàng' : 'Hết hàng'}</span>
                <button
                  onClick={() => onFilterChange({ ...filters, availability: null })}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter; 