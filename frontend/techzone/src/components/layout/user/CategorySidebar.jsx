import React, { useRef, useEffect, useState } from 'react';

const CategorySidebar = ({
  mainCategories = [],
  subcategoriesByParent = {},
  hoveredCategory,
  setHoveredCategory,
  sidebarRef,
  sidebarHeight,
  handleCategoryMouseEnter,
  handleCategoryMouseLeave,
  floatingMenuRef,
  handleFloatingMenuMouseEnter,
  handleFloatingMenuMouseLeave,
  handleGroupHeaderClick,
  handleChildSubcategoryClick,
  showHeader = true,
}) => {
  return (
    <div className="mt-6 relative">
      <div className="w-80 bg-white rounded-2xl shadow-lg z-10">
        {showHeader && (
          <div className="bg-green-600 rounded-t-2xl px-6 py-4">
            <div className="flex items-center space-x-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-white font-semibold text-lg">DANH MỤC SẢN PHẨM</h2>
            </div>
          </div>
        )}
        <div className="py-2">
          {mainCategories.map((category, index) => (
            <div
              key={category._id}
              onMouseEnter={() => handleCategoryMouseEnter(category._id)}
              className="relative"
            >
              <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  {category.icon && (
                    <img src={`${category.icon}`} alt="NaN" className="w-6 h-6 object-contain" />
                  )}
                  <div className="font-medium text-gray-900">{category.name}</div>
                </div>
              </div>
              {index < mainCategories.length - 1 && (
                <div className="mx-4 border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating subcategory menu */}
      {hoveredCategory && subcategoriesByParent[hoveredCategory] && (
        <>
          {/* Invisible bridge to cover the gap */}
          <div 
            className="absolute top-0 left-full w-8 h-full bg-transparent z-15"
            onMouseEnter={handleFloatingMenuMouseEnter}
            onMouseLeave={handleFloatingMenuMouseLeave}
          />
          <div
            ref={floatingMenuRef}
            className="absolute top-0 left-full ml-1 bg-white rounded-2xl shadow-lg py-2 px-4 min-w-[400px] z-20"
            style={{ height: `${sidebarHeight - 20}px`, overflowY: 'auto' }}
            onMouseEnter={handleFloatingMenuMouseEnter}
            onMouseLeave={handleFloatingMenuMouseLeave}
          >
            {/* Invisible bridge on the left side of floating menu */}
            <div 
              className="absolute -left-8 top-0 w-8 h-full bg-transparent"
              onMouseEnter={handleFloatingMenuMouseEnter}
              onMouseLeave={handleFloatingMenuMouseLeave}
            />
            <div className="grid grid-cols-2 gap-4">
              {subcategoriesByParent[hoveredCategory].map(subcat => (
                <div key={subcat._id} className="space-y-1">
                  <div 
                    className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg border-l-4 border-green-500 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleGroupHeaderClick(subcat.name)}
                  >
                    {subcat.name}
                  </div>
                  {/* Nested subcategories for this parent */}
                  {subcategoriesByParent[subcat._id] && (
                    <div className="ml-2 space-y-1">
                      {subcategoriesByParent[subcat._id].map(childSubcat => (
                        <div
                          key={childSubcat._id}
                          className="px-3 py-1.5 text-sm text-gray-700 hover:text-green-600 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                          onClick={() => handleChildSubcategoryClick(childSubcat._id, childSubcat.name)}
                        >
                          {childSubcat.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySidebar; 