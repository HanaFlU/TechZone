import React, { useEffect, useState, useRef } from 'react';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import BrandService from '../services/BrandService';
import SubcategoryService from '../services/SubcategoryService';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isSubcatHovered, setIsSubcatHovered] = useState(false);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const submenuHideTimer = useRef(null);
  const sidebarRef = useRef(null);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [sidebarTop, setSidebarTop] = useState(0);
  const categoryItemRefs = useRef({});
  const [newsIndex, setNewsIndex] = useState(0); // For Tin tức carousel
  const newsItemsToShow = 3;
  const newsProducts = products; // You can replace this with actual news data if available
  const maxNewsIndex = Math.max(0, newsProducts.length - newsItemsToShow);
  const handleNewsLeft = () => setNewsIndex(i => Math.max(0, i - 1));
  const handleNewsRight = () => setNewsIndex(i => Math.min(maxNewsIndex, i + 1));
  // For transition
  const newsCarouselRef = useRef();

  useEffect(() => {
    ProductService.getAllProducts()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    CategoryService.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    BrandService.getAllBrands()
      .then(data => setBrands(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      setBannerHeight(sidebarRef.current.offsetHeight);
      setSidebarTop(sidebarRef.current.offsetTop);
    }
  }, [sidebarRef, hoveredCategory]);

  // Fetch subcategories on hover
  useEffect(() => {
    if (hoveredCategory) {
      SubcategoryService.getSubcategoriesByCategory(hoveredCategory)
        .then(data => setSubcategories(data))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [hoveredCategory]);

  const handleSubcategoryClick = (subcategoryId) => {
    setExpandedSubcategory(subcategoryId);
  };

  // No filtering: always show all products
  const filteredProducts = products;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-0 pb-4 -mt-2">
          <div className="flex gap-8 mb-8 relative">
            <div ref={sidebarRef} className="mt-6">
              <CategorySidebar
                categories={categories}
                categoryItemRefs={categoryItemRefs}
                hoveredCategory={hoveredCategory}
                setHoveredCategory={setHoveredCategory}
                isSubcatHovered={isSubcatHovered}
                setIsSubcatHovered={setIsSubcatHovered}
                handleCategoryMouseEnter={categoryId => {
                  if (submenuHideTimer.current) clearTimeout(submenuHideTimer.current);
                  setHoveredCategory(categoryId);
                }}
                handleCategoryMouseLeave={() => {
                  submenuHideTimer.current = setTimeout(() => {
                    setHoveredCategory(null);
                  }, 120);
                }}
                handleSubcatMouseEnter={() => {
                  if (submenuHideTimer.current) clearTimeout(submenuHideTimer.current);
                  setIsSubcatHovered(true);
                }}
                handleSubcatMouseLeave={() => {
                  submenuHideTimer.current = setTimeout(() => {
                    setIsSubcatHovered(false);
                    setHoveredCategory(null);
                  }, 120);
                }}
                subcategories={subcategories}
                expandedSubcategory={expandedSubcategory}
                handleSubcategoryClick={handleSubcategoryClick}
              />
            </div>
            {/* Banner/Ads Placeholder */}
            <div className="flex-1 mt-6">
              <div
                className="w-full bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-2xl shadow flex items-center justify-center"
              >
                <img
                  src="/BUILDPC-Banner.png"
                  alt="TechZone Banner"
                  className="w-full h-auto object-cover rounded-2xl"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </div>
          {/* Main Content Area: All Products Section */}
          <div className="w-full">
            {/* Original Sản phẩm nổi bật section (top) */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center flex-1">
                  <span className="h-0.5 w-16 bg-gray-300 mr-4 hidden sm:inline-block"></span>
                  <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">Sản phẩm nổi bật</h2>
                  <span className="h-0.5 w-16 bg-gray-300 ml-4 hidden sm:inline-block"></span>
                </div>
                <button
                  className="absolute right-0 top-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
                  style={{ minWidth: '110px' }}
                >
                  View All
                </button>
              </div>
              {loading ? (
                <div>Đang tải sản phẩm...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.slice(0, 4).map(product => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
                      <div className="relative bg-gray-100 flex items-center justify-center" style={{height:208}}>
                        <img src={product.image} alt={product.name} className="object-contain h-52 w-full" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        {product.category && <span className="text-xs text-gray-500 mb-1">{product.category.name || product.category}</span>}
                        <h3 className="text-base font-semibold text-gray-900 mb-2 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{product.name}</h3>
                        {product.specs && (
                          <div className="text-xs text-gray-600 mb-2 flex flex-wrap gap-x-2 gap-y-1 items-center">
                            {/* Only show type for CPU, skip other CPU specs */}
                            {!(product.category && (product.category.name === 'CPU' || product.category === 'CPU')) && (
                              <>
                                {product.specs.cores && product.specs.threads && (
                                  <span><span className="font-medium">{product.specs.cores}C/{product.specs.threads}T</span></span>
                                )}
                                {product.specs.base_clock && product.specs.boost_clock && (
                                  <span><span className="font-medium">{product.specs.base_clock}→{product.specs.boost_clock}</span></span>
                                )}
                                {product.specs.socket && (
                                  <span><span className="font-medium">{product.specs.socket}</span></span>
                                )}
                                {product.specs.tdp && (
                                  <span><span className="font-medium">{product.specs.tdp}</span></span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-lg font-bold text-emerald-600">{product.price?.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <button className="mt-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-emerald-200">Mua ngay</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            {/* Duplicated section for CPU */}
            <section className="mb-12">
              <div className="flex items-center mb-6 relative">
                <h2 className="text-2xl font-bold text-gray-900 mr-4 whitespace-nowrap">CPU</h2>
                <div className="flex-1 border-t border-gray-300 mr-40"></div>
                <button
                  className="absolute right-0 top-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors ml-2"
                  style={{ minWidth: '110px' }}
                >
                  View All
                </button>
              </div>
              {loading ? (
                <div>Đang tải sản phẩm...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.slice(0, 4).map(product => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
                      <div className="relative bg-gray-100 flex items-center justify-center" style={{height:208}}>
                        <img src={product.image} alt={product.name} className="object-contain h-52 w-full" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        {product.category && <span className="text-xs text-gray-500 mb-1">{product.category.name || product.category}</span>}
                        <h3 className="text-base font-semibold text-gray-900 mb-2 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{product.name}</h3>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-lg font-bold text-emerald-600">{product.price?.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <button className="mt-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-emerald-200">Mua ngay</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            {/* Duplicated section for Màn hình */}
            <section className="mb-12">
              <div className="flex items-center mb-6 relative">
                <h2 className="text-2xl font-bold text-gray-900 mr-4 whitespace-nowrap">Màn hình</h2>
                <div className="flex-1 border-t border-gray-300 mr-40"></div>
                <button
                  className="absolute right-0 top-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors ml-2"
                  style={{ minWidth: '110px' }}
                >
                  View All
                </button>
              </div>
              {loading ? (
                <div>Đang tải sản phẩm...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.slice(0, 4).map(product => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
                      <div className="relative bg-gray-100 flex items-center justify-center" style={{height:208}}>
                        <img src={product.image} alt={product.name} className="object-contain h-52 w-full" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        {product.category && <span className="text-xs text-gray-500 mb-1">{product.category.name || product.category}</span>}
                        <h3 className="text-base font-semibold text-gray-900 mb-2 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{product.name}</h3>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-lg font-bold text-emerald-600">{product.price?.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <button className="mt-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-emerald-200">Mua ngay</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            {/* Duplicated section for Phụ kiện */}
            <section className="mb-12">
              <div className="flex items-center mb-6 relative">
                <h2 className="text-2xl font-bold text-gray-900 mr-4 whitespace-nowrap">Phụ kiện</h2>
                <div className="flex-1 border-t border-gray-300 mr-40"></div>
                <button
                  className="absolute right-0 top-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors ml-2"
                  style={{ minWidth: '110px' }}
                >
                  View All
                </button>
              </div>
              {loading ? (
                <div>Đang tải sản phẩm...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.slice(0, 4).map(product => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
                      <div className="relative bg-gray-100 flex items-center justify-center" style={{height:208}}>
                        <img src={product.image} alt={product.name} className="object-contain h-52 w-full" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        {product.category && <span className="text-xs text-gray-500 mb-1">{product.category.name || product.category}</span>}
                        <h3 className="text-base font-semibold text-gray-900 mb-2 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{product.name}</h3>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-lg font-bold text-emerald-600">{product.price?.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <button className="mt-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-emerald-200">Mua ngay</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            {/* Duplicated section for Sản phẩm nổi bật (bottom, now Tin tức) */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center flex-1">
                  <span className="h-0.5 w-16 bg-gray-300 mr-4 hidden sm:inline-block"></span>
                  <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">Tin tức</h2>
                  <span className="h-0.5 w-16 bg-gray-300 ml-4 hidden sm:inline-block"></span>
                </div>
              </div>
              {loading ? (
                <div>Đang tải sản phẩm...</div>
              ) : (
                <div className="flex items-center justify-center gap-6">
                  <button
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow-sm hover:border-green-600 hover:bg-green-50 hover:shadow-md transition-all duration-150 active:scale-95 disabled:opacity-50"
                    onClick={handleNewsLeft}
                    disabled={newsIndex === 0}
                  >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="overflow-hidden w-[1080px]">
                    <div
                      ref={newsCarouselRef}
                      className="flex gap-6"
                      style={{
                        transform: `translateX(-${newsIndex * (340 + 24)}px)`, // 340px width + 24px gap
                        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)'
                      }}
                    >
                      {newsProducts.map(product => (
                        <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden w-[340px] flex-shrink-0">
                          <div className="relative bg-gray-100 flex items-center justify-center" style={{height:208}}>
                            <img src={product.image} alt={product.name} className="object-contain h-52 w-full" />
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            {product.category && <span className="text-xs text-gray-500 mb-1">{product.category.name || product.category}</span>}
                            <h3 className="text-base font-semibold text-gray-900 mb-2 overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>{product.name}</h3>
                            <div className="flex items-end gap-2 mb-2">
                              <span className="text-lg font-bold text-emerald-600">{product.price?.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <button className="mt-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-emerald-200">Mua ngay</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow-sm hover:border-green-600 hover:bg-green-50 hover:shadow-md transition-all duration-150 active:scale-95 disabled:opacity-50"
                    onClick={handleNewsRight}
                    disabled={newsIndex === maxNewsIndex}
                  >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySidebar = ({
  categories,
  categoryItemRefs,
  hoveredCategory,
  setHoveredCategory,
  isSubcatHovered,
  handleCategoryMouseEnter,
  handleCategoryMouseLeave,
  handleSubcatMouseEnter,
  handleSubcatMouseLeave,
  subcategories,
  expandedSubcategory,
  handleSubcategoryClick
}) => {
  const activeCategoryId = hoveredCategory || (isSubcatHovered ? hoveredCategory : null);
  const activeCatObj = categories.find(cat => cat._id === activeCategoryId);
  const activeSubcategories = subcategories.filter(
    sc => sc.category === activeCategoryId || (sc.category && sc.category._id === activeCategoryId)
  );
  const grouped = activeSubcategories.reduce((acc, subcat) => {
    const group = subcat.group || 'Other';
    acc[group] = acc[group] || [];
    acc[group].push(subcat);
    return acc;
  }, {});
  const showSubcatMenu = (hoveredCategory || isSubcatHovered) && activeCatObj && activeSubcategories.length > 0;

  return (
    <div className="relative">
      <div className="w-80 bg-white rounded-2xl shadow-lg z-10">
        <div className="bg-green-600 rounded-t-2xl px-6 py-4">
          <div className="flex items-center space-x-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-white font-semibold text-lg">DANH MỤC SẢN PHẨM</h2>
          </div>
        </div>
        <div className="py-2">
          {categories.map((category, index) => (
            <div
              key={category._id}
              ref={el => categoryItemRefs.current[category._id] = el}
              onMouseEnter={() => handleCategoryMouseEnter(category._id)}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className={`flex items-center space-x-3`}>
                  {category.icon && (
                    <img src={`/assets/icons/${category.icon}`} alt={category.name} className="w-6 h-6 object-contain" />
                  )}
                  <div className={`font-medium ${category._id === hoveredCategory ? 'text-green-600' : 'text-gray-900'}`}>{category.name}</div>
                </div>
              </div>
              {index < categories.length - 1 && (
                <div className="mx-4 border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showSubcatMenu && (
        <div
          className="bg-gray-50 rounded-r-2xl shadow-lg py-2 flex absolute top-0 left-80 z-20"
          style={{ minHeight: '100%', transition: 'opacity 0.2s', width: `${Object.keys(grouped).length * 160}px` }}
          onMouseEnter={handleSubcatMouseEnter}
          onMouseLeave={handleSubcatMouseLeave}
        >
          {Object.entries(grouped).map(([group, items]) => (
            <div className="flex-1 p-2 min-w-[160px]" key={group}>
              <div className={
                group.toLowerCase() === 'intel'
                  ? "font-semibold text-center text-blue-700 mb-2"
                  : group.toLowerCase() === 'amd'
                  ? "font-semibold text-center text-red-700 mb-2"
                  : "font-semibold text-center text-blue-700 mb-2"
              }>
                {group}
              </div>
              <div className="flex flex-col">
                {items.map(subcat => (
                  <div
                    key={subcat._id}
                    className={`px-4 py-2 cursor-pointer transition-colors text-sm font-medium ${expandedSubcategory === subcat._id ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
                    onClick={() => handleSubcategoryClick(subcat._id)}
                  >
                    {subcat.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;