import React, { useState, useEffect, useCallback } from 'react';

const ProductFilter = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  maxPrice = 10000000,
  availableSpecs = []
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    specs: true
  });

  // State for price range (min and max values)
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: maxPrice
  });

  // State for input display values (allows empty strings for better UX)
  const [inputValues, setInputValues] = useState({
    min: '0',
    max: maxPrice.toString()
  });

  // State for specifications filter - now supports multiple values per spec
  const [selectedSpecs, setSelectedSpecs] = useState({});

  // State for expanding spec values within each category
  const [expandedSpecValues, setExpandedSpecValues] = useState({});

  // Debounce timer for slider updates
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debounce timer for spec changes
  const [specDebounceTimer, setSpecDebounceTimer] = useState(null);

  // Update price range when maxPrice changes
  useEffect(() => {
    setPriceRange(prev => ({
      ...prev,
      max: maxPrice
    }));
    setInputValues(prev => ({
      ...prev,
      max: maxPrice.toString()
    }));
  }, [maxPrice]);

  // Initialize price range from current filter
  useEffect(() => {
    if (filters.priceRange) {
      const min = filters.priceRange.min || 0;
      const max = filters.priceRange.max || maxPrice;
      setPriceRange({ min, max });
      setInputValues({
        min: min.toString(),
        max: max.toString()
      });
    } else {
      setPriceRange({
        min: 0,
        max: maxPrice
      });
      setInputValues({
        min: '0',
        max: maxPrice.toString()
      });
    }
  }, [filters.priceRange, maxPrice]);

  // Initialize selected specs from current filter
  useEffect(() => {
    if (filters.specs) {
      const specsMap = {};
      filters.specs.forEach(spec => {
        if (!specsMap[spec.key]) {
          specsMap[spec.key] = [];
        }
        specsMap[spec.key].push(spec.value);
      });
      setSelectedSpecs(specsMap);
    } else {
      setSelectedSpecs({});
    }
  }, [filters.specs]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (specDebounceTimer) {
        clearTimeout(specDebounceTimer);
      }
    };
  }, [debounceTimer, specDebounceTimer]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle spec values expansion for a specific spec category
  const toggleSpecValues = (specKey) => {
    setExpandedSpecValues(prev => ({
      ...prev,
      [specKey]: !prev[specKey]
    }));
  };

  const handlePriceRangeChange = (range) => {
    // Clear any pending debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    
    onFilterChange({
      ...filters,
      priceRange: range,
      page: 1
    });
  };

  // Handle min price input change
  const handleMinPriceChange = (value) => {
    // Update input display value immediately
    setInputValues(prev => ({
      ...prev,
      min: value
    }));
    
    // Only update price range if we have a valid number
    if (value === '' || isNaN(parseInt(value))) {
      return;
    }
    
    const minValue = parseInt(value);
    const newRange = {
      ...priceRange,
      min: Math.min(minValue, priceRange.max)
    };
    
    setPriceRange(newRange);
    debouncedFilterUpdate(newRange);
  };

  // Handle max price input change
  const handleMaxPriceChange = (value) => {
    // Update input display value immediately
    setInputValues(prev => ({
      ...prev,
      max: value
    }));
    
    // Only update price range if we have a valid number
    if (value === '' || isNaN(parseInt(value))) {
      return;
    }
    
    const maxValue = parseInt(value);
    const newRange = {
      ...priceRange,
      max: Math.max(maxValue, priceRange.min)
    };
    
    setPriceRange(newRange);
    debouncedFilterUpdate(newRange);
  };

  // Debounced function to update specs filter
  const debouncedSpecUpdate = useCallback((newSelectedSpecs) => {
    // Clear existing timer
    if (specDebounceTimer) {
      clearTimeout(specDebounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      // Convert to array format for API
      const specsArray = Object.entries(newSelectedSpecs).flatMap(([key, values]) =>
        values.map(value => ({ key, value }))
      );
      
      onFilterChange({
        ...filters,
        specs: specsArray.length > 0 ? specsArray : null,
        page: 1
      });
    }, 600); // Wait 600ms after spec changes

    setSpecDebounceTimer(timer);
  }, [specDebounceTimer, filters, onFilterChange]);

  const handleSpecChange = (specKey, specValue, isChecked) => {
    const newSelectedSpecs = { ...selectedSpecs };
    
    if (!newSelectedSpecs[specKey]) {
      newSelectedSpecs[specKey] = [];
    }
    
    if (isChecked) {
      // Add value if not already selected
      if (!newSelectedSpecs[specKey].includes(specValue)) {
        newSelectedSpecs[specKey].push(specValue);
      }
    } else {
      // Remove value if selected
      newSelectedSpecs[specKey] = newSelectedSpecs[specKey].filter(value => value !== specValue);
    }
    
    // Remove empty arrays
    if (newSelectedSpecs[specKey].length === 0) {
      delete newSelectedSpecs[specKey];
    }
    
    // Update local state immediately for visual feedback
    setSelectedSpecs(newSelectedSpecs);
    
    // Debounce the filter update
    debouncedSpecUpdate(newSelectedSpecs);
  };

  // Debounced function to update filter after price range changes
  const debouncedFilterUpdate = useCallback((range) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      const customRange = {
        min: range.min,
        max: range.max,
        label: range.min > 0 ? `${formatPrice(range.min)} - ${formatPrice(range.max)}` : `Dưới ${formatPrice(range.max)}`
      };
      
      onFilterChange({
        ...filters,
        priceRange: customRange,
        page: 1
      });
    }, 1000); // Increased to 1000ms for better performance

    setDebounceTimer(timer);
  }, [debounceTimer, filters, onFilterChange]);

  // Handle slider value changes (local state only)
  const handleSliderChange = (value) => {
    const maxValue = parseInt(value);
    
    // Update local state immediately (for visual feedback)
    setPriceRange(prev => ({
      ...prev,
      max: maxValue
    }));
    
    // Debounce the filter update
    debouncedFilterUpdate({
      ...priceRange,
      max: maxValue
    });
  };

  // Handle dual range slider changes
  const handleDualSliderChange = (type, value) => {
    const numValue = parseInt(value);
    
    if (type === 'min') {
      const newMin = Math.min(numValue, priceRange.max - 1);
      const newRange = {
        ...priceRange,
        min: newMin
      };
      setPriceRange(newRange);
      setInputValues(prev => ({
        ...prev,
        min: newMin.toString()
      }));
      debouncedFilterUpdate(newRange);
    } else if (type === 'max') {
      const newMax = Math.max(numValue, priceRange.min + 1);
      const newRange = {
        ...priceRange,
        max: newMax
      };
      setPriceRange(newRange);
      setInputValues(prev => ({
        ...prev,
        max: newMax.toString()
      }));
      debouncedFilterUpdate(newRange);
    }
  };

  // Mouse event handlers for dual slider
  const [isDragging, setIsDragging] = useState(null); // 'min' or 'max' or null

  const handleMouseDown = (type) => {
    setIsDragging(type);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const value = Math.round((percent / 100) * maxPrice);
    
    if (isDragging === 'min') {
      const newMin = Math.max(0, Math.min(value, priceRange.max - 1));
      const newRange = {
        ...priceRange,
        min: newMin
      };
      setPriceRange(newRange);
      setInputValues(prev => ({
        ...prev,
        min: newMin.toString()
      }));
    } else if (isDragging === 'max') {
      const newMax = Math.min(maxPrice, Math.max(value, priceRange.min + 1));
      const newRange = {
        ...priceRange,
        max: newMax
      };
      setPriceRange(newRange);
      setInputValues(prev => ({
        ...prev,
        max: newMax.toString()
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Only update filter when dragging stops
      debouncedFilterUpdate(priceRange);
    }
    setIsDragging(null);
  };

  // Handle clicking on the slider track
  const handleTrackClick = (e) => {
    // Don't handle clicks if we're dragging
    if (isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const value = Math.round((percent / 100) * maxPrice);
    
    // Determine which handle to move based on which is closer
    const minDistance = Math.abs(value - priceRange.min);
    const maxDistance = Math.abs(value - priceRange.max);
    
    if (minDistance <= maxDistance) {
      // Move min handle
      const newMin = Math.max(0, Math.min(value, priceRange.max - 1));
      const newRange = {
        ...priceRange,
        min: newMin
      };
      setPriceRange(newRange);
      setInputValues(prev => ({
        ...prev,
        min: newMin.toString()
      }));
      debouncedFilterUpdate(newRange);
    } else {
      // Move max handle
      const newMax = Math.min(maxPrice, Math.max(value, priceRange.min + 1));
      const newRange = {
        ...priceRange,
        max: newMax
      };
      setPriceRange(newRange);
      setInputValues(prev => ({
        ...prev,
        max: newMax.toString()
      }));
      debouncedFilterUpdate(newRange);
    }
  };

  // Add global mouse up listener when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(null);
      };
      
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

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
          <div className="space-y-4">
            {/* Price Range Slider */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Tùy chỉnh giá tối đa:</h4>
              
              {/* Price Input Fields */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Giá tối thiểu:</label>
                  <input
                    type="number"
                    min="0"
                    max={priceRange.max}
                    value={inputValues.min}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Giá tối đa:</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={maxPrice}
                    value={inputValues.max}
                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder={maxPrice.toString()}
                  />
                </div>
              </div>

              {/* Dual Range Slider */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">Khoảng giá:</label>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>{formatPrice(priceRange.min)}</span>
                  <span>{formatPrice(priceRange.max)}</span>
                </div>
                <div 
                  className="dual-slider-container"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={handleTrackClick}
                >
                  <div className="dual-slider-track"></div>
                  <div 
                    className="dual-slider-range"
                    style={{
                      left: `${(priceRange.min / maxPrice) * 100}%`,
                      width: `${((priceRange.max - priceRange.min) / maxPrice) * 100}%`
                    }}
                  ></div>
                  <div 
                    className="dual-slider-thumb dual-slider-min"
                    style={{
                      left: `${(priceRange.min / maxPrice) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown('min');
                    }}
                  ></div>
                  <div 
                    className="dual-slider-thumb dual-slider-max"
                    style={{
                      left: `${(priceRange.max / maxPrice) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown('max');
                    }}
                  ></div>
                </div>
              </div>


            </div>
          </div>
        )}
      </div>

      {/* Specifications Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('specs')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-medium text-gray-900">Thông số kỹ thuật</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              expandedSections.specs ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.specs && availableSpecs.length > 0 && (
          <div className="space-y-4">
            {availableSpecs.map((spec) => {
              const isExpanded = expandedSpecValues[spec.key];
              const displayValues = isExpanded ? spec.values : spec.values.slice(0, 3);
              const hasMoreValues = spec.values.length > 3;
              
              return (
                <div key={spec.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {spec.label}:
                  </label>
                  <div className="space-y-2">
                    {displayValues.map((value) => (
                      <label key={value} className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSpecs[spec.key]?.includes(value) || false}
                          onChange={(e) => handleSpecChange(spec.key, value, e.target.checked)}
                          className="mr-2 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Show More/Less Button for spec values */}
                  {hasMoreValues && (
                    <button
                      onClick={() => toggleSpecValues(spec.key)}
                      className="w-full text-xs text-emerald-600 hover:text-emerald-700 font-medium py-1 border-t border-gray-100"
                    >
                      {isExpanded ? 'Thu gọn' : `Hiển thị thêm (${spec.values.length - 3})`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {expandedSections.specs && availableSpecs.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Không có thông số kỹ thuật nào cho danh mục này
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(filters.priceRange || (filters.specs && filters.specs.length > 0)) && (
        <div className="pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Bộ lọc đang áp dụng:</h4>
          <div className="space-y-1">
            {filters.priceRange && (
              <div className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                <span>Giá: {filters.priceRange.label}</span>
                <button
                  onClick={() => onFilterChange({ ...filters, priceRange: null, page: 1 })}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
            {filters.specs && filters.specs.map((spec, index) => {
              // Find the spec label from availableSpecs
              const specInfo = availableSpecs.find(s => s.key === spec.key);
              const specLabel = specInfo ? specInfo.label : spec.key;
              
              return (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                  <span>{specLabel}: {spec.value}</span>
                  <button
                    onClick={() => {
                      const newSpecs = filters.specs.filter((_, i) => i !== index);
                      onFilterChange({ 
                        ...filters, 
                        specs: newSpecs.length > 0 ? newSpecs : null, 
                        page: 1 
                      });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter; 